"use client";

import { useEffect, useRef } from "react";
import styles from "./styles.module.css";

export function CursorBubble() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = ref.current;
    if (!cursor) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reduce.matches || !hover.matches) return;

    cursor.dataset.enabled = "true";

    const onMove = (event: PointerEvent) => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    const onOver = (event: PointerEvent) => {
      const target = event.target;
      const isInteractive =
        target instanceof Element &&
        Boolean(target.closest("a, button, input, textarea, label, select"));
      cursor.classList.toggle(styles.big, isInteractive);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
    };
  }, []);

  return <div ref={ref} aria-hidden className={styles.cursor} />;
}
