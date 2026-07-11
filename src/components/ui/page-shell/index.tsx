import type { ComponentProps } from "react";
import { cn } from "@/config/cn";
import styles from "./styles.module.css";

export function PageShell({
  fixedHeaderOffset = false,
  className,
  ...props
}: {
  fixedHeaderOffset?: boolean;
} & ComponentProps<"div">) {
  return (
    <div
      className={cn(
        styles.root,
        fixedHeaderOffset && styles.fixedHeaderOffset,
        className,
      )}
      {...props}
    />
  );
}
