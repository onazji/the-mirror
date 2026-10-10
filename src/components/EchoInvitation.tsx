import styles from "./EchoInvitation.module.css";

type Props = {
  onExplore: () => void;
  onDismiss: () => void;
};

export function EchoInvitation({ onExplore, onDismiss }: Props) {
  return (
    <div className={styles.backdrop}>
      <section
        className={styles.invitation}
        role="dialog"
        aria-modal="true"
        aria-labelledby="echo-invitation-title"
      >
        <div className={styles.mark} aria-hidden="true">◌</div>
        <div>
          <h2 id="echo-invitation-title" className={styles.title}>An Echo has surfaced.</h2>
          <p className={styles.copy}>A familiar moment has appeared before.</p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={onDismiss}>
            Not now
          </button>
          <button type="button" className={styles.primary} onClick={onExplore} autoFocus>
            Explore Echo
          </button>
        </div>
      </section>
    </div>
  );
}
