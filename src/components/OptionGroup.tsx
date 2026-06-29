import styles from "./OptionGroup.module.css";
import { lightHaptic } from "../utils/haptics";

type Props<T extends string> = {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
};

export function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <div className={styles.group}>
      <div className={styles.label}>{label}</div>

      <div className={styles.row}>
        {options.map((opt) => {
          const active = value === opt;

          return (
            <button
              key={opt}
              type="button"
              className={`${styles.opt} ${
                active ? styles.active : ""
              }`}
              onClick={() => { lightHaptic(); onChange(opt); }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}