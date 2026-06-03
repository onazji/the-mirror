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

const pillStyle = (active: boolean): React.CSSProperties => ({
  minHeight: 44,
  padding: "10px 20px",
  borderRadius: 99,
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 500,
  color: active ? "#7a5200" : "var(--text)",
  border: active
    ? "1px solid rgba(210,165,70,0.80)"
    : "1px solid rgba(255,255,255,0.78)",
  background: active
    ? "linear-gradient(160deg, rgba(255,237,190,0.70) 0%, rgba(255,220,150,0.45) 100%)"
    : "linear-gradient(160deg, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.42) 100%)",
  boxShadow: active
    ? "inset 0 1.5px 0 rgba(255,255,255,0.88), 0 0 20px rgba(220,170,60,0.28), 0 0 0 1px rgba(210,165,70,0.20)"
    : "inset 0 1.5px 0 rgba(255,255,255,0.88), 0 2px 12px rgba(80,80,140,0.08)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  transition: "background 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease",
});

export function WorkSection({ value, onChange }: Props) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={() => onChange({ ...value, app: !value.app })} style={pillStyle(value.app)}>
          App
        </button>
        <button type="button" onClick={() => onChange({ ...value, game: !value.game })} style={pillStyle(value.game)}>
          Game
        </button>
        <button type="button" onClick={() => onChange({ ...value, output: !value.output })} style={pillStyle(value.output)}>
          Other
        </button>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontSize: 14, color: "var(--muted)", fontWeight: 500 }}>Sessions</div>
        <div style={{ display: "flex", gap: 8 }}>
          {([1, 2, 3] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ ...value, sessions: n })}
              style={pillStyle(value.sessions === n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 500 }}>1-line proof</span>
        <textarea
          className="mirrorTextarea"
          value={value.note}
          onChange={(e) => onChange({ ...value, note: e.target.value })}
          placeholder="What did I actually do?"
          rows={3}
        />
      </label>
    </section>
  );
}
