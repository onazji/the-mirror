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
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.16)",
              background:
                value === option ? "rgba(255,255,255,0.12)" : "transparent",
              color: "var(--text)",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}