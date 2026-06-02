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

const glassButton = (active: boolean): React.CSSProperties => ({
  minHeight: 44,
  padding: "10px 16px",
  borderRadius: 18,
  cursor: "pointer",
  color: active ? "#fff8ef" : "rgba(255,255,255,0.88)",
  border: active
    ? "1px solid rgba(232,192,138,0.92)"
    : "1px solid rgba(255,255,255,0.28)",
  background: active
    ? "linear-gradient(180deg, rgba(255,232,200,0.26), rgba(246,217,176,0.14))"
    : "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))",
  boxShadow: active
    ? "inset 0 1px 0 rgba(255,255,255,0.30), 0 0 24px rgba(255,232,200,0.28), 0 0 0 1px rgba(232,192,138,0.22)"
    : "inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 20px rgba(0,0,0,0.08)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  transition:
    "background 180ms ease, border-color 180ms ease, color 180ms ease, transform 100ms ease, box-shadow 180ms ease",
});

export function WorkSection({ value, onChange }: Props) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => onChange({ ...value, app: !value.app })}
          style={glassButton(value.app)}
        >
          App
        </button>

        <button
          type="button"
          onClick={() => onChange({ ...value, game: !value.game })}
          style={glassButton(value.game)}
        >
          Game
        </button>

        <button
          type="button"
          onClick={() => onChange({ ...value, output: !value.output })}
          style={glassButton(value.output)}
        >
          Other
        </button>
      </div>

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
              style={glassButton(value.sessions === n)}
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
            borderRadius: 18,
            padding: 12,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))",
            color: "var(--text)",
            border: "1px solid rgba(255,255,255,0.28)",
            resize: "vertical",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 20px rgba(0,0,0,0.08)",
          }}
        />
      </label>
    </section>
  );
}