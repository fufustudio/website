import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/config/cn";
import styles from "./styles.module.css";

const families = {
  mono: styles.mono,
  sans: styles.sans,
} as const;

const tones = {
  accent: styles.toneAccent,
  inherit: styles.toneInherit,
  light: styles.toneLight,
} as const;

export type EyebrowProps = ComponentPropsWithoutRef<"p"> & {
  as?: "p" | "span";
  family?: keyof typeof families;
  tone?: keyof typeof tones;
};

export function Eyebrow({
  as: Element = "p",
  family = "sans",
  tone = "accent",
  className,
  ...props
}: EyebrowProps) {
  return (
    <Element
      className={cn(styles.root, families[family], tones[tone], className)}
      {...props}
    />
  );
}
