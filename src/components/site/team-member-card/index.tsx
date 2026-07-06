import styles from "./styles.module.css";

export function TeamMemberCard({
  role,
  name,
  href,
  placeholder,
  bio,
}: {
  role: string;
  name: string;
  href: string;
  placeholder: string;
  bio: string;
}) {
  return (
    <article className={styles.card}>
      <div className={styles.portrait} aria-label={placeholder} role="img">
        <span className={styles.placeholderIcon} aria-hidden>
          +
        </span>
        <span>{placeholder}</span>
      </div>
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
