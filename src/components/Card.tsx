import styles from "./Card.module.css";

export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className={styles.card}>
      {title ? <div className={styles.title}>{title}</div> : null}
      <div>{children}</div>
    </div>
  );
}
