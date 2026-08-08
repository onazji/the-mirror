import { useEffect, useState } from "react";
import type { MirrorCard } from "../services/cardEngine";
import { MirrorCardVisual } from "./MirrorCardVisual";
import styles from "./CardRevealOverlay.module.css";
import type { MirrorAvatarVariant } from "../types/avatar";

import maleAlignment from "../assets/mirror/male/alignment.png";
import maleAnxiety from "../assets/mirror/male/anxiety.png";
import maleDrift from "../assets/mirror/male/drift.png";
import maleFlow from "../assets/mirror/male/flow.png";
import maleIdle from "../assets/mirror/male/idle.png";
import maleOverdrive from "../assets/mirror/male/overdrive.png";
import malePatience from "../assets/mirror/male/patience.png";
import malePressure from "../assets/mirror/male/pressure.png";
import maleStagnant from "../assets/mirror/male/stagnant.png";
import femaleAlignment from "../assets/mirror/female/alignment.png";
import femaleAnxiety from "../assets/mirror/female/anxiety.png";
import femaleDrift from "../assets/mirror/female/drift.png";
import femaleFlow from "../assets/mirror/female/flow.png";
import femaleIdle from "../assets/mirror/female/idle.png";
import femaleOverdrive from "../assets/mirror/female/overdrive.png";
import femalePatience from "../assets/mirror/female/patience.png";
import femalePressure from "../assets/mirror/female/pressure.png";
import femaleStagnant from "../assets/mirror/female/stagnant.png";

type Props = {
  card: MirrorCard;
  avatarVariant: MirrorAvatarVariant;
  onClose: () => void;
};

const AVATAR_IMAGES: Record<MirrorAvatarVariant, Record<string, string>> = {
  male: {
    Alignment: maleAlignment,
    Anxiety: maleAnxiety,
    Drift: maleDrift,
    Flow: maleFlow,
    Idle: maleIdle,
    Overdrive: maleOverdrive,
    Patience: malePatience,
    Pressure: malePressure,
    Stagnant: maleStagnant,
  },
  female: {
    Alignment: femaleAlignment,
    Anxiety: femaleAnxiety,
    Drift: femaleDrift,
    Flow: femaleFlow,
    Idle: femaleIdle,
    Overdrive: femaleOverdrive,
    Patience: femalePatience,
    Pressure: femalePressure,
    Stagnant: femaleStagnant,
  },
};

export function CardRevealOverlay({ card, avatarVariant, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const avatarImage = AVATAR_IMAGES[avatarVariant][card.title];

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
          {avatarImage ? (
            <img
              src={avatarImage}
              alt={`${card.title} Mirror avatar`}
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