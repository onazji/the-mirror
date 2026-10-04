import { useEffect, type CSSProperties } from "react";
import styles from "./ReflectiveTransition.module.css";
import {
  SELENITE_DURATION_MS,
  SELENITE_SWAP_MS,
} from "./seleniteMaterial";

export const REFLECTIVE_TRANSITION_DURATION_MS = SELENITE_DURATION_MS;

type Props = {
  direction: "down" | "up";
  onSwap: () => void;
  onComplete: () => void;
};

const MATERIAL_FIELDS = [
  { origin: 12, drift: -0.7, phase: -0.7, opacity: 0.52, scale: 1.035 },
  { origin: 84, drift: 0.6, phase: 0.25, opacity: 0.38, scale: 1.015 },
  { origin: 46, drift: -0.2, phase: 0.7, opacity: 0.3, scale: 1.055 },
] as const;

export function ReflectiveTransition({ onSwap, onComplete }: Props) {
  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      onSwap();
      const completeTimer = window.setTimeout(onComplete, 0);
      return () => window.clearTimeout(completeTimer);
    }

    const swapTimer = window.setTimeout(onSwap, SELENITE_SWAP_MS);
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
      className={styles.overlay}
      style={
        {
          "--selenite-duration": `${REFLECTIVE_TRANSITION_DURATION_MS}ms`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <div className={styles.environment} />
      <div className={styles.material}>
        {MATERIAL_FIELDS.map((field, index) => (
          <div
            key={index}
            className={styles.field}
            style={
              {
                "--field-origin": `${field.origin}%`,
                "--field-drift": `${field.drift}px`,
                "--field-phase": field.phase,
                "--field-opacity": field.opacity,
                "--field-opacity-18": field.opacity * 0.38,
                "--field-opacity-32": field.opacity * 0.7,
                "--field-opacity-48": field.opacity * 0.92,
                "--field-opacity-76": field.opacity * 0.76,
                "--field-opacity-90": field.opacity * 0.32,
                "--field-scale": field.scale,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className={styles.pearl} />
      <div className={styles.depth} />
    </div>
  );
}
