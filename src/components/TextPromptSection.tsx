type Props = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

export function TextPromptSection({
  label,
  placeholder,
  value,
  onChange,
  required,
}: Props) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)" }}>
        {label}{required ? <span style={{ color: "var(--gold)", marginLeft: 3 }}>*</span> : null}
      </label>
      <textarea
        className="mirrorTextarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    </div>
  );
}
