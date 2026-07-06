import { cn } from "@/lib/cn";
import styles from "./styles.module.css";

export function LetteredHeroTitle({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <h1 aria-label={text} className={cn(styles.title, className)}>
      <span aria-hidden="true" className={styles.words}>
        {words.map((word) => (
          <span key={word} className={styles.word}>
            {Array.from(word).map((letter, index) => (
              <span
                key={`${word}-${letter}-${index}`}
                className={styles.letter}
              >
                {letter}
              </span>
            ))}
          </span>
        ))}
      </span>
    </h1>
  );
}
