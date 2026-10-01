import { useEffect, type CSSProperties } from "react";
import styles from "./ReflectiveTransition.module.css";

// Laboratory timing, not the final shipping duration. CSS stage offsets are
// relative to this one duration, so the whole choreography can be compressed.
export const REFLECTIVE_TRANSITION_DURATION_MS = 2800;
const CREST_PROGRESS = 9 / 14;
const REFLECTIVE_TRANSITION_SWAP_MS = Math.round(
  REFLECTIVE_TRANSITION_DURATION_MS * CREST_PROGRESS,
);

type Props = {
  direction: "down" | "up";
  onSwap: () => void;
  onComplete: () => void;
};

export function ReflectiveTransition({
  direction,
  onSwap,
  onComplete,
}: Props) {
  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      onSwap();
      const completeTimer = window.setTimeout(onComplete, 0);

      return () => {
        window.clearTimeout(completeTimer);
      };
    }

    const swapTimer = window.setTimeout(onSwap, REFLECTIVE_TRANSITION_SWAP_MS);
    const completeTimer = window.setTimeout(
      onComplete,
      REFLECTIVE_TRANSITION_DURATION_MS,
    );

    return () => {
      window.clearTimeout(swapTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete, onSwap]);

  return (
    <div
      className={`${styles.overlay} ${
        direction === "down" ? styles.down : styles.up
      }`}
      style={
        {
          "--selenite-duration": `${REFLECTIVE_TRANSITION_DURATION_MS}ms`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <div className={styles.material}>
        <div className={styles.density} />
        <div className={styles.transmission} />
      </div>
    </div>
  );
}