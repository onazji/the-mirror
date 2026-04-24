import type { MirrorCard } from "../services/cardEngine";
import styles from "./MirrorCardVisual.module.css";

type Props = {
  card: MirrorCard;
};

export function MirrorCardVisual({ card }: Props) {
  return (
    <div className={`${styles.card} ${styles[card.id]}`}>
      <div className={styles.topLabel}>MIRROR CARD</div>

      <div className={styles.symbol}>
        <div className={styles.orb} />
      </div>

      <div className={styles.content}>
        <div className={styles.title}>{card.title}</div>
        <div className={styles.line}>{card.line}</div>
      </div>
    </div>
  );
}