import type { ReactNode } from "react";
import { Eyebrow } from "@/components/eyebrow";
import { Heading, type HeadingLevel } from "@/components/heading";
import { cn } from "@/config/cn";
import styles from "./styles.module.css";

const alignments = {
  center: styles.center,
  left: styles.left,
} as const;

const widths = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
} as const;

const gaps = {
  none: "",
  default: styles.gapDefault,
  spacious: styles.gapSpacious,
} as const;

export function SectionHeading({
  eyebrow,
  heading,
  intro,
  align = "center",
  width = "md",
  gap = "default",
  headingAs = "h2",
  headingClassName,
  introClassName,
  className,
}: {
  eyebrow?: ReactNode;
  heading: ReactNode;
  intro?: ReactNode;
  align?: keyof typeof alignments;
  width?: keyof typeof widths;
  gap?: keyof typeof gaps;
  headingAs?: HeadingLevel;
  headingClassName?: string;
  introClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        styles.root,
        alignments[align],
        widths[width],
        gaps[gap],
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading
        as={headingAs}
        className={cn(
          eyebrow ? styles.headingAfterEyebrow : undefined,
          headingClassName,
        )}
      >
        {heading}
      </Heading>
      {intro ? (
        <p className={cn(styles.intro, introClassName)}>{intro}</p>
      ) : null}
    </div>
  );
}
