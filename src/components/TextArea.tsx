import styles from "./TextArea.module.css";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export function TextArea({ value, onChange, placeholder }: Props) {
  return (
    <textarea
      className={styles.ta}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={5}
    />
  );
}
