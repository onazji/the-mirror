import { useEffect, useState } from "react";
import type { MirrorCard } from "../services/cardEngine";
import { MirrorCardVisual } from "./MirrorCardVisual";
import styles from "./CardRevealOverlay.module.css";

import alignment from "../assets/cards/alignment.jpeg";
import anxiety from "../assets/cards/anxiety.jpeg";
import drift from "../assets/cards/drift.jpeg";
import flow from "../assets/cards/flow.jpeg";
import idle from "../assets/cards/idle.jpeg";
import overdrive from "../assets/cards/overdrive.jpeg";
import patience from "../assets/cards/patience.jpeg";
import pressure from "../assets/cards/pressure.jpeg";
import stagnant from "../assets/cards/stagnant.jpeg";

type Props = {
  card: MirrorCard;
  onClose: () => void;
};

const CARD_IMAGES: Record<string, string> = {
  Alignment: alignment,
  Anxiety: anxiety,
  Drift: drift,
  Flow: flow,
  Idle: idle,
  Overdrive: overdrive,
  Patience: patience,
  Pressure: pressure,
  Stagnant: stagnant,
};

export function CardRevealOverlay({ card, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const cardImage = CARD_IMAGES[card.title];

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
    }, 160);

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

        <div className={visible ? styles.cardVisible : styles.cardHidden}>
          {cardImage ? (
            <img
              src={cardImage}
              alt={`${card.title} reflection card`}
              className={styles.cardImage}
            />
          ) : (
            <MirrorCardVisual card={card} />
          )}
        </div>

        <div className={styles.footer}>
          This is what the moment reflected.
        </div>
      </div>
    </div>
  );
}