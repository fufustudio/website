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
  OrganicPointer,
  OrganicSimulation,
  OrganicTone,
} from "@/lib/organic-color-field-simulation";
import styles from "./styles.module.css";

export function OrganicColorField({
  tone = "light",
  className,
}: {
  tone?: OrganicTone;
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
    const scratch = document.createElement("canvas");
    const pointer: OrganicPointer = { x: 0, y: 0, active: false };
    let simulation: OrganicSimulation | null = null;
    let visible = true;
    let raf = 0;
    let lastTime = performance.now();
    let rootRect = root.getBoundingClientRect();
    let pixelRatio = 1;

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
      pointer.x = event.clientX - rootRect.left;
      pointer.y = event.clientY - rootRect.top;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const resizeObserver = new ResizeObserver(measure);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
    });

    measure();
    resizeObserver.observe(root);
    intersectionObserver.observe(root);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);

    if (!reducedMotion.matches) {
      raf = window.requestAnimationFrame(tick);
    }

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
      window.cancelAnimationFrame(raf);
    };
  }, [tone]);

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
