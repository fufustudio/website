import { cn } from "@/lib/cn";
import styles from "./styles.module.css";

export function SectionMarker({
  children,
  dark = false,
  className,
}: {
  children: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(styles.root, dark && styles.dark, className)}>
      <span>{children}</span>
      <span className={styles.rule} />
    </div>
  );
}
