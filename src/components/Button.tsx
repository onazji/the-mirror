import styles from "./Button.module.css";

type Props = {
  label: string;
  onClick: () => void;
  kind?: "primary" | "secondary";
  disabled?: boolean;
};

export function Button({ label, onClick, kind = "primary", disabled }: Props) {
  return (
    <button
      className={'${styles.btn} ${king === "styles.primary : styles.secondary}'}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {label}
    </button>
  );
}
