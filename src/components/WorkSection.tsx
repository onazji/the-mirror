type Props = {
  value: {
    app: boolean;
    game: boolean;
    output: boolean;
    sessions: 1 | 2 | 3;
    note: string;
  };
  onChange: (value: Props["value"]) => void;
};

export function WorkSection({ value, onChange }: Props) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={value.app}
          onChange={(e) => onChange({ ...value, app: e.target.checked })}
        />
        <span>App</span>
      </label>

      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={value.game}
          onChange={(e) => onChange({ ...value, game: e.target.checked })}
        />
        <span>Game</span>
      </label>

      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={value.output}
          onChange={(e) => onChange({ ...value, output: e.target.checked })}
        />
        <span>Other</span>
      </label>

      <div style={{ display: "grid", gap: 8 }}>
        <div>Sessions</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() =>
                onChange({ ...value, sessions: n as 1 | 2 | 3 })
              }
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.16)",
                background:
                  value.sessions === n
                    ? "rgba(255,255,255,0.12)"
                    : "transparent",
                color: "var(--text)",
                cursor: "pointer",
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <label style={{ display: "grid", gap: 8 }}>
        <span>1-line proof</span>
        <textarea
          value={value.note}
          onChange={(e) => onChange({ ...value, note: e.target.value })}
          placeholder="What did I actually do?"
          rows={3}
          style={{
            width: "100%",
            borderRadius: 12,
            padding: 12,
            background: "rgba(255,255,255,0.06)",
            color: "var(--text)",
            border: "1px solid rgba(255,255,255,0.12)",
            resize: "vertical",
          }}
        />
      </label>
    </section>
  );
}