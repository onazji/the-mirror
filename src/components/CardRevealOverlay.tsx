import { useEffect, useState } from "react";
import type { MirrorCard } from "../services/cardEngine";
import { MirrorCardVisual } from "./MirrorCardVisual";
import styles from "./CardRevealOverlay.module.css";

type Props = {
  card: MirrorCard;
  onClose: () => void;
};

export function CardRevealOverlay({ card, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
    }, 160); // 👈 subtle delay (tweak 120–220 if needed)

    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.close}
          aria-label="Close reflection"
          onClick={onClose}
        >
          ×
        </button>

        <div className={styles.kicker}>Reflection</div>

        {/* 👇 staged appearance */}
        <div
          className={
            visible ? styles.cardVisible : styles.cardHidden
          }
        >
          <MirrorCardVisual card={card} />
        </div>

        <div className={styles.footer}>
          This is what the moment reflected.
        </div>
      </div>
    </div>
  );
}