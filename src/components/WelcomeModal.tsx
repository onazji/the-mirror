import styles from "./WelcomeModal.module.css";

type Props = {
  onContinue: () => void;
  onClose: () => void;
};

export function WelcomeModal({ onContinue, onClose }: Props) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          aria-label="Close welcome"
          onClick={onClose}
        >
          ×
        </button>
        <div className={styles.kicker}>The Mirror</div>
        <h1 id="welcome-title" className={styles.title}>
          Welcome to The Mirror
        </h1>
        <p className={styles.lead}>Pause and notice where you are.</p>
        <p className={styles.copy}>
          The Mirror reflects your Energy, Momentum, Presence, and Focus—without
          judgment or pressure to become something else.
        </p>
        <p className={styles.privacy}>Your reflections remain on this device.</p>
        <button type="button" className={styles.action} onClick={onContinue}>
          Choose Your Mirror
        </button>
      </div>
    </div>
  );
}