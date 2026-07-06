import { ImageFrame } from "@/components/ui/image-frame";
import type { ResponsiveImageContent } from "@/lib/responsive-image";
import styles from "./styles.module.css";

export function TeamMemberCard({
  role,
  name,
  href,
  placeholder,
  portrait,
  bio,
}: {
  role: string;
  name: string;
  href: string;
  placeholder: string;
  portrait?: ResponsiveImageContent;
  bio: string;
}) {
  return (
    <article className={styles.card}>
      {portrait ? (
        <ImageFrame image={portrait} className={styles.portrait} />
      ) : (
        <div className={styles.portrait} aria-label={placeholder} role="img">
          <svg
            className={styles.placeholderIcon}
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden
          >
            <rect
              x="1.5"
              y="1.5"
              width="15"
              height="15"
              rx="2.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <circle cx="7" cy="7" r="1.7" fill="currentColor" opacity="0.62" />
            <path
              d="m4 13 3.2-3.4 2.4 2.3 1.7-1.7L14 13"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.2"
            />
          </svg>
          <span>{placeholder}</span>
        </div>
      )}
      <div className={styles.copy}>
        <p className={styles.role}>{role}</p>
        <h3 className={styles.name}>
          <a href={href} target="_blank" rel="noopener noreferrer">
            {name}
          </a>
        </h3>
        <p className={styles.bio}>{bio}</p>
      </div>
    </article>
  );
}
