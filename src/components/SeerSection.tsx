type Props = {
  value: {
    anchor: boolean;
    integrity: boolean;
  };
  onChange: (value: Props["value"]) => void;
};

export function SeerSection({ value, onChange }: Props) {
  return (
    <section style={{ display: "grid", gap: 12 }}>

      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={value.anchor}
          onChange={(e) =>
            onChange({ ...value, anchor: e.target.checked })
          }
        />
        <span>I touched the builder path</span>
      </label>

      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={value.integrity}
          onChange={(e) =>
            onChange({ ...value, integrity: e.target.checked })
          }
        />
        <span>I held the line</span>
      </label>
    </section>
  );
}