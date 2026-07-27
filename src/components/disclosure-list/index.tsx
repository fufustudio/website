import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/config/cn";
import styles from "./styles.module.css";

export function DisclosureList({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(styles.list, className)} {...props} />;
}

export function DisclosureItem({
  title,
  children,
  className,
  summaryClassName,
  titleClassName = styles.title,
  bodyClassName = styles.bodyText,
  bodySpacing = true,
  ...props
}: {
  title: ReactNode;
  children: ReactNode;
  summaryClassName?: string;
  titleClassName?: string;
  bodyClassName?: string;
  bodySpacing?: boolean;
} & Omit<ComponentProps<"details">, "title">) {
  return (
    <details className={cn(styles.item, className)} {...props}>
      <summary className={cn(styles.summary, summaryClassName)}>
        <span className={titleClassName}>{title}</span>
        <span className={styles.icon} aria-hidden>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </summary>
      <div
        className={cn(
          styles.body,
          bodySpacing && styles.bodySpaced,
          bodyClassName,
        )}
      >
        {children}
      </div>
    </details>
  );
}
