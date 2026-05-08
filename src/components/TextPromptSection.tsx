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
      <label style={{ fontWeight: 700 }}>
        {label} {required ? "*" : ""}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.16)",
          background: "rgba(255,255,255,0.06)",
          color: "var(--text)",
          outline: "none",
        }}
      />
    </div>
  );
}