import styles from "./OptionGroup.module.css";

type Props<T extends string> = {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
};

export function OptionGroup<T extends string>({ label, options, value, onChange }: Props<T>) {
  return (
    <div className={styles.group}>
      <div className={styles.label}>{label}</div>
      <div className={styles.row}>
        {options.map(opt => {
          const active = value === opt;
          return (
            <button
              key={opt}
              className={'${styles.opt} ${active ? styles.active : ""}' }
              onClick={() => onChange(opt)}
              type="button"
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
