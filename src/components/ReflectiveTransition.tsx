import { useEffect } from "react";
import styles from "./ReflectiveTransition.module.css";

export const REFLECTIVE_TRANSITION_DURATION_MS = 220;
const REFLECTIVE_TRANSITION_SWAP_MS = 100;

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
      aria-hidden="true"
    >
      <div className={styles.sweep} />
    </div>
  );
}