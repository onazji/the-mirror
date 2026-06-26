import { useState, useRef, useEffect } from "react";

type Props = {
  value: {
    app: boolean;
    game: boolean;
    output: boolean;
    creative?: boolean;
    physical?: boolean;
    customActivity?: string;
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

type OtherMode = "off" | "editing" | "confirmed";

export function WorkSection({ value, onChange }: Props) {
  const [otherMode, setOtherMode] = useState<OtherMode>(() =>
    value.output && value.customActivity?.trim() ? "confirmed" : "off"
  );
  const [inputDraft, setInputDraft] = useState(value.customActivity ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (otherMode === "editing") {
      inputRef.current?.focus();
    }
  }, [otherMode]);

  function openEditing() {
    setOtherMode("editing");
    onChange({ ...value, output: true });
  }

  function confirm() {
    const trimmed = inputDraft.trim();
    if (trimmed) {
      setOtherMode("confirmed");
      onChange({ ...value, output: true, customActivity: trimmed });
    } else {
      setOtherMode("off");
      onChange({ ...value, output: false, customActivity: "" });
    }
  }

  function deselect() {
    setOtherMode("off");
    setInputDraft("");
    onChange({ ...value, output: false, customActivity: "" });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      confirm();
    }
    if (e.key === "Escape") {
      deselect();
    }
  }

  let otherSlot: React.ReactNode;

  if (otherMode === "editing") {
    otherSlot = (
      <input
        ref={inputRef}
        type="text"
        value={inputDraft}
        onChange={(e) => setInputDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={confirm}
        placeholder="Enter activity..."
        style={{
          minHeight: 44,
          padding: "10px 20px",
          borderRadius: 99,
          fontSize: 15,
          fontWeight: 500,
          color: "#7a5200",
          border: "1px solid rgba(210,165,70,0.80)",
          background: "linear-gradient(160deg, rgba(255,237,190,0.70) 0%, rgba(255,220,150,0.45) 100%)",
          boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.88), 0 0 20px rgba(220,170,60,0.28)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          outline: "none",
          width: 160,
          maxWidth: "100%",
        }}
      />
    );
  } else if (otherMode === "confirmed") {
    otherSlot = (
      <button
        type="button"
        onClick={deselect}
        style={pillStyle(true)}
      >
        {value.customActivity?.trim() || "Other"}
      </button>
    );
  } else {
    otherSlot = (
      <button
        type="button"
        onClick={openEditing}
        style={pillStyle(false)}
      >
        Other
      </button>
    );
  }

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={() => onChange({ ...value, app: !value.app })} style={pillStyle(value.app)}>
          Personal
        </button>
        <button type="button" onClick={() => onChange({ ...value, game: !value.game })} style={pillStyle(value.game)}>
          Professional
        </button>
        <button type="button" onClick={() => onChange({ ...value, creative: !value.creative })} style={pillStyle(!!value.creative)}>
          Creative
        </button>
        <button type="button" onClick={() => onChange({ ...value, physical: !value.physical })} style={pillStyle(!!value.physical)}>
          Physical
        </button>
        {otherSlot}
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
