import styles from "./styles.module.css";

export function DraftModeControls() {
  return (
    <aside className={styles.root} aria-label="Preview controls">
      <a className={styles.link} href="/api/draft-mode/disable">
        Exit preview
      </a>
    </aside>
  );
}
