"use client";

import type { MouseEvent, ReactNode } from "react";
import {
  buttonClasses,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/button";

export function HashScrollLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ariaLabel,
}: {
  href: `#${string}`;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const shouldSmoothScroll = !window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const id = href.slice(1);
    const target = document.getElementById(id);

    if (!target) return;

    event.preventDefault();
    window.history.pushState(null, "", href);
    target.scrollIntoView({
      behavior: shouldSmoothScroll ? "smooth" : "auto",
      block: "start",
    });
  }

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={buttonClasses(variant, className, size)}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
