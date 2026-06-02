import styles from "./Button.module.css";
import { useState } from "react";

type Props = {
  label: string;
  onClick: () => void;
  kind?: "primary" | "secondary";
  disabled?: boolean;
};

export function Button({ label, onClick, kind = "primary", disabled }: Props) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      className={`${styles.btn} ${
        kind === "primary" ? styles.primary : styles.secondary
      }`}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      disabled={disabled}
      type="button"
      style={{
        transform: pressed ? "scale(0.97)" : "scale(1)",
        transition: "transform 0.08s ease",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <span>{label}</span>
      <span className={styles.chevron}>›</span>
    </button>
  );
}
