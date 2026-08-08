import { useState } from "react";
import type { MirrorAvatarVariant } from "../types/avatar";
import styles from "./AvatarChoiceModal.module.css";

type Props = {
  value: MirrorAvatarVariant | null;
  onboarding?: boolean;
  onSelect: (variant: MirrorAvatarVariant) => void;
  onClose?: () => void;
};

export function AvatarChoiceModal({
  value,
  onboarding = false,
  onSelect,
  onClose,
}: Props) {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-choice-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.kicker}>Mirror</div>
        <h2 id="avatar-choice-title" className={styles.title}>
          {onboarding ? "Choose Your Mirror" : "Mirror Avatar"}
        </h2>
        <p className={styles.copy}>
          Which Mirror would you like to see reflecting your journey?
        </p>

        <div className={styles.options}>
          {(
            [
              ["male", "Masculine"],
              ["female", "Feminine"],
            ] as const
          ).map(([variant, label]) => (
            <button
              key={variant}
              type="button"
              className={`${styles.option} ${value === variant ? styles.optionSelected : ""}`}
              aria-pressed={value === variant}
              onClick={() => onSelect(variant)}
            >
              <span className={styles.optionTitle}>{label}</span>
              <span className={styles.optionHint}>
                {value === variant ? "Selected" : "Use this form"}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className={styles.why}
          onClick={() => setShowWhy((visible) => !visible)}
          aria-expanded={showWhy}
        >
          ⓘ Why are there two?
        </button>

        {showWhy ? (
          <div className={styles.info}>
            <strong>About Mirror Avatars</strong>
            <br />
            Mirror avatars are behavioral silhouettes, not characters.
            Psychological state is conveyed through posture, weight
            distribution, tension, orientation, and hand placement. Identity
            markers—including facial features, clothing, ethnicity, hairstyle,
            age, and accessories—are intentionally omitted so attention
            remains on the state itself rather than the individual. Your
            selection simply chooses which symbolic form appears during Mirror
            card reveals. Both variants communicate the exact same
            psychological state. Future emotional nuance is expressed through
            the Mirror Light System rather than changes to the body itself.
          </div>
        ) : null}

        {!onboarding && onClose ? (
          <button type="button" className={styles.close} onClick={onClose}>
            Done
          </button>
        ) : null}
      </div>
    </div>
  );
}