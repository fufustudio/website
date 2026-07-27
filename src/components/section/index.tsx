import type { ComponentProps } from "react";
import { cn } from "@/config/cn";
import styles from "./styles.module.css";

const tones = {
  default: styles.toneDefault,
  raised: styles.raised,
  muted: styles.muted,
  feature: styles.feature,
  contrast: styles.contrast,
} as const;

const sizes = {
  compact: styles.compact,
  default: styles.default,
  page: styles.page,
  spacious: styles.spacious,
} as const;

export type SectionTone = keyof typeof tones;
export type SectionSize = keyof typeof sizes;

export function Section({
  tone = "default",
  size = "default",
  className = "",
  ...props
}: {
  tone?: SectionTone;
  size?: SectionSize;
} & ComponentProps<"section">) {
  return (
    <section
      className={cn(styles.root, sizes[size], tones[tone], className)}
      {...props}
    />
  );
}
