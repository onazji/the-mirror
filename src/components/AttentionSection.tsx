import type { AttentionTag } from "../types/mirror";

type Props = {
  value: AttentionTag;
  onChange: (value: AttentionTag) => void;
};

const OPTIONS: AttentionTag[] = ["waste", "bugs", "features", "brainstorm"];

export function AttentionSection({ value, onChange }: Props) {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {OPTIONS.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              style={{
                minHeight: 44,
                padding: "10px 20px",
                borderRadius: 99,
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 500,
                textTransform: "capitalize",
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
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}
