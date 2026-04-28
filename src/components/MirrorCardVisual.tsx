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

        <div className={styles.line}>
          {card.line}
        </div>

        {/* NEW: Meaning layer */}
        <div
          className={styles.meaning}
          style={{
            marginTop: 6,
            fontSize: 13,
            opacity: 0.7,
            lineHeight: 1.4,
          }}
        >
          {card.meaning}
        </div>
      </div>
    </div>
  );
}