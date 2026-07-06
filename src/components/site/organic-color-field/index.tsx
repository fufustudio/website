"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import styles from "./styles.module.css";

type BlobTone = "light" | "dark";

type BlobConfig = {
  className: string;
  color: string;
};

const blobs: Record<BlobTone, BlobConfig[]> = {
  light: [
    { className: styles.blobClay, color: "rgba(222, 173, 137, 0.62)" },
    { className: styles.blobYellow, color: "rgba(250, 217, 157, 0.66)" },
    { className: styles.blobBlue, color: "rgba(140, 172, 191, 0.6)" },
  ],
  dark: [
    { className: styles.blobClay, color: "rgba(74, 49, 29, 0.58)" },
    { className: styles.blobYellow, color: "rgba(69, 55, 28, 0.5)" },
    { className: styles.blobBlue, color: "rgba(30, 50, 66, 0.66)" },
  ],
};

type BlobState = {
  el: HTMLDivElement;
  index: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  phase: number;
  initialX: number;
  initialY: number;
  mass: number;
  reach: number;
  pull: number;
  initialized: boolean;
};

type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export function OrganicColorField({
  tone = "light",
  className,
}: {
  tone?: BlobTone;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let pointerX = 0;
    let pointerY = 0;
    let pointerActive = false;
    let raf = 0;
    let visible = true;
    let rootRect = root.getBoundingClientRect();
    let lastTime = performance.now();
    const blobEls = Array.from(
      root.querySelectorAll<HTMLDivElement>("[data-organic-blob]"),
    );
    const blobStates: BlobState[] = blobEls.map((el, index) => ({
      el,
      index,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      w: 0,
      h: 0,
      phase: index * 1.35,
      initialX: [0.2, 0.52, 0.82][index] ?? 0.5,
      initialY: [0.72, 0.46, 0.66][index] ?? 0.58,
      mass: [0.82, 1.08, 0.94][index] ?? 1,
      reach: [1.08, 1.22, 0.96][index] ?? 1,
      pull: [0.9, 1.1, 0.82][index] ?? 1,
      initialized: false,
    }));

    const getBounds = (blob: BlobState): Bounds => {
      const minX = blob.w * 0.62;
      const maxX = rootRect.width - blob.w * 0.62;
      const minY = blob.h * 0.38;
      const maxY = rootRect.height - blob.h * 0.38;

      if (minX > maxX) {
        const centerX = rootRect.width / 2;
        return { minX: centerX, maxX: centerX, minY, maxY };
      }

      if (minY > maxY) {
        const centerY = rootRect.height / 2;
        return { minX, maxX, minY: centerY, maxY: centerY };
      }

      return { minX, maxX, minY, maxY };
    };

    const containBlob = (blob: BlobState, bounds: Bounds) => {
      if (blob.x < bounds.minX) {
        blob.x = bounds.minX;
        blob.vx = Math.abs(blob.vx) * 0.45;
      } else if (blob.x > bounds.maxX) {
        blob.x = bounds.maxX;
        blob.vx = -Math.abs(blob.vx) * 0.45;
      }

      if (blob.y < bounds.minY) {
        blob.y = bounds.minY;
        blob.vy = Math.abs(blob.vy) * 0.45;
      } else if (blob.y > bounds.maxY) {
        blob.y = bounds.maxY;
        blob.vy = -Math.abs(blob.vy) * 0.45;
      }
    };

    const measure = () => {
      rootRect = root.getBoundingClientRect();
      for (const blob of blobStates) {
        const rect = blob.el.getBoundingClientRect();
        blob.w = rect.width;
        blob.h = rect.height;
        const bounds = getBounds(blob);

        if (!blob.initialized) {
          blob.x = rootRect.width * blob.initialX;
          blob.y = rootRect.height * blob.initialY;
          blob.initialized = true;
        } else {
          containBlob(blob, bounds);
        }
        containBlob(blob, bounds);

        blob.el.style.left = "0px";
        blob.el.style.top = "0px";
        blob.el.style.right = "auto";
        blob.el.style.bottom = "auto";
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX - rootRect.left;
      pointerY = event.clientY - rootRect.top;
      pointerActive = true;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
    });

    const tick = (time: number) => {
      const dt = Math.min(32, time - lastTime) / 16.67;
      lastTime = time;

      if (visible) {
        for (const [index, blob] of blobStates.entries()) {
          const flowX =
            Math.sin(time * (0.0005 + index * 0.000075) + blob.phase) *
            0.052 *
            blob.pull;
          const flowY =
            Math.cos(time * (0.00043 + index * 0.000065) + blob.phase) *
            0.046 *
            blob.pull;

          blob.vx += flowX * dt;
          blob.vy += flowY * dt;

          if (pointerActive) {
            const dx = blob.x - pointerX;
            const dy = blob.y - pointerY;
            const dist = Math.hypot(dx, dy);
            const radius =
              Math.max(320, Math.min(560, rootRect.width * 0.52)) * blob.reach;

            if (dist < radius && dist > 0.01) {
              const force = (1 - dist / radius) ** 2;
              blob.vx += (dx / dist) * force * (4.1 / blob.mass) * dt;
              blob.vy += (dy / dist) * force * (4.1 / blob.mass) * dt;
            }
          }

          for (const other of blobStates) {
            if (other === blob) continue;

            const dx = blob.x - other.x;
            const dy = blob.y - other.y;
            const dist = Math.hypot(dx, dy);
            const separation = Math.min(blob.w, blob.h) * 0.26;

            if (dist < separation && dist > 0.01) {
              const force = (1 - dist / separation) * 0.34;
              blob.vx += (dx / dist) * force * dt;
              blob.vy += (dy / dist) * force * dt;
            }
          }

          const bounds = getBounds(blob);

          blob.vx *= 0.965;
          blob.vy *= 0.965;
          blob.vx = Math.min(Math.max(blob.vx, -11), 11);
          blob.vy = Math.min(Math.max(blob.vy, -11), 11);
          blob.x += blob.vx * dt;
          blob.y += blob.vy * dt;
          containBlob(blob, bounds);

          const scale =
            1 + 0.09 * Math.sin(time * (0.0005 + index * 0.00005) + blob.phase);
          const opacity =
            0.82 +
            0.18 *
              Math.sin(time * (0.00038 + index * 0.00004) + blob.phase + index);

          blob.el.style.transform = `translate3d(${(
            blob.x -
            blob.w / 2
          ).toFixed(
            2,
          )}px, ${(blob.y - blob.h / 2).toFixed(2)}px, 0) scale(${scale.toFixed(
            4,
          )})`;
          blob.el.style.opacity = opacity.toFixed(3);
        }
      }

      raf = window.requestAnimationFrame(tick);
    };

    measure();
    observer.observe(root);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    raf = window.requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("pointermove", onPointerMove);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn(styles.root, styles[tone], className)}
    >
      {blobs[tone].map((blob, index) => (
        <div
          key={`${tone}-${index}`}
          data-organic-blob
          className={cn(styles.blob, blob.className)}
          style={{ "--blob-color": blob.color } as CSSProperties}
        />
      ))}
    </div>
  );
}
