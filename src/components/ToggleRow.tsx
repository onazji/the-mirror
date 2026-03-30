import styles from "./ToggleRow.module.css";

type Props = {
  label: string;
  value: boolean;
  onToggle: () => void;
};

export function ToggleRow({ label, value, onToggle }: Props) {
  return (
    <button type="button" className={styles.row} onClick={onToggle}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value ? "On" : "Off"}</span>
    </button>
  );
}
