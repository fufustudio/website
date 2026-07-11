import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/config/cn";
import styles from "./styles.module.css";

const sizes = {
  display: styles.display,
  section: styles.section,
  module: styles.module,
  item: styles.item,
} as const;

export type HeadingSize = keyof typeof sizes;

const tones = {
  default: styles.toneDefault,
  inherit: styles.toneInherit,
  light: styles.toneLight,
} as const;

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

const defaultSizes: Record<HeadingLevel, HeadingSize> = {
  h1: "display",
  h2: "section",
  h3: "item",
  h4: "item",
  h5: "item",
  h6: "item",
};

export type HeadingProps = Omit<ComponentPropsWithoutRef<"h2">, "color"> & {
  as?: HeadingLevel;
  size?: HeadingSize;
  tone?: keyof typeof tones;
};

export function Heading({
  as: Element = "h2",
  size,
  tone = "default",
  className,
  ...props
}: HeadingProps) {
  return (
    <Element
      className={cn(
        styles.root,
        sizes[size ?? defaultSizes[Element]],
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
