"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import {
  createOrganicSimulation,
  renderOrganicSimulation,
  resizeOrganicSimulation,
  stepOrganicSimulation,
} from "@/lib/organic-color-field-simulation";
import type {
  OrganicFieldVariant,
  OrganicPointer,
  OrganicSimulation,
  OrganicTone,
} from "@/lib/organic-color-field-simulation";
import styles from "./styles.module.css";

export function OrganicColorField({
  tone = "light",
  variant = "hero",
  className,
}: {
  tone?: OrganicTone;
  variant?: OrganicFieldVariant;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });

    if (!root || !canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const scratch = document.createElement("canvas");
    const pointer: OrganicPointer = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      speed: 0,
      active: false,
    };
    let simulation: OrganicSimulation | null = null;
    let visible = true;
    let raf = 0;
    let lastTime = performance.now();
    let rootRect = root.getBoundingClientRect();
    let pixelRatio = 1;
    let lastPointerClientX = 0;
    let lastPointerClientY = 0;
    let lastPointerTime = 0;
    let hasPointer = false;

    const render = () => {
      if (!simulation) return;

      context.save();
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      renderOrganicSimulation({ simulation, context, scratch });
      context.restore();
    };

    const measure = () => {
      rootRect = root.getBoundingClientRect();
      const width = Math.max(1, Math.round(rootRect.width));
      const height = Math.max(1, Math.round(rootRect.height));
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      pixelRatio = ratio;

      if (
        canvas.width !== Math.round(width * ratio) ||
        canvas.height !== Math.round(height * ratio)
      ) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      if (!simulation) {
        simulation = createOrganicSimulation({
          width,
          height,
          tone,
          variant,
          reducedMotion: reducedMotion.matches,
        });
      } else {
        resizeOrganicSimulation(simulation, width, height);
      }

      render();
    };

    const tick = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (visible && simulation && !reducedMotion.matches) {
        stepOrganicSimulation(simulation, pointer, delta);
        render();
      }

      raf = window.requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      const now = performance.now();

      if (hasPointer) {
        const dt = Math.max(8, Math.min(64, now - lastPointerTime));
        const frameScale = 16.67 / dt;
        const nextVx = (event.clientX - lastPointerClientX) * frameScale;
        const nextVy = (event.clientY - lastPointerClientY) * frameScale;

        pointer.vx = pointer.vx * 0.35 + nextVx * 0.65;
        pointer.vy = pointer.vy * 0.35 + nextVy * 0.65;
        pointer.speed = Math.hypot(pointer.vx, pointer.vy);
      }

      pointer.x = event.clientX - rootRect.left;
      pointer.y = event.clientY - rootRect.top;
      pointer.active = true;
      lastPointerClientX = event.clientX;
      lastPointerClientY = event.clientY;
      lastPointerTime = now;
      hasPointer = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
      pointer.vx = 0;
      pointer.vy = 0;
      pointer.speed = 0;
      hasPointer = false;
    };

    const shouldTrackPointer = finePointer.matches;

    const resizeObserver = new ResizeObserver(measure);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
    });

    measure();
    resizeObserver.observe(root);
    intersectionObserver.observe(root);
    if (shouldTrackPointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave);
      window.addEventListener("blur", onPointerLeave);
    }

    if (!reducedMotion.matches) {
      raf = window.requestAnimationFrame(tick);
    }

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (shouldTrackPointer) {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerleave", onPointerLeave);
        window.removeEventListener("blur", onPointerLeave);
      }
      window.cancelAnimationFrame(raf);
    };
  }, [tone, variant]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn(styles.root, styles[tone], className)}
    >
      <canvas ref={canvasRef} data-organic-canvas className={styles.canvas} />
    </div>
  );
}
