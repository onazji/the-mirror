import { useState } from "react";
import { mediumHaptic, modalHaptic } from "../utils/haptics";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { OptionGroup } from "../components/OptionGroup";
import { TextPromptSection } from "../components/TextPromptSection";

import type { MirrorDraft, Energy, Pace, Body, Mind } from "../types/mirror";

import styles from "./CheckScreen.module.css";
import { SeerSection } from "../components/SeerSection";
import { WorkSection } from "../components/WorkSection";

type Props = {
  draft: MirrorDraft;
  onChange: (next: MirrorDraft) => void;
  onNext: () => void;
  onBack: () => void;
  submitting: boolean;
};

const ENERGY: readonly Energy[] = ["low", "steady", "high"] as const;
const PACE: readonly Pace[] = ["low", "steady", "high"] as const;
const BODY: readonly Body[] = ["relaxed", "content", "tense"] as const;
const MIND: readonly Mind[] = ["narrow", "wide", "scattered"] as const;

export function CheckScreen({
  draft,
  onChange,
  onNext,
  onBack,
  submitting,
}: Props) {
  const [showStateInfo, setShowStateInfo] = useState(false);

  const complete = !!(
    draft.energy &&
    draft.pace &&
    draft.tomorrowStart.trim()
  );

  return (
    <div className="container">
      <h1>Mirror</h1>

      <Card>
        <div style={{ display: "grid", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Show Up</h3>

          <SeerSection
            anchor={draft.seer?.anchor ?? null}
            integrity={draft.seer?.integrity ?? null}
            onChange={(seer) => onChange({ ...draft, seer })}
          />
        </div>
      </Card>

      <div style={{ height: 16 }} />

      <Card>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 style={{ margin: 0 }}>State</h3>
            <button
              type="button"
              aria-label="What is State?"
              onClick={() => { modalHaptic(); setShowStateInfo(true); }}
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                border: "1px solid rgba(28,27,53,0.20)",
                background: "rgba(255,255,255,0.60)",
                color: "var(--muted)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              ⓘ
            </button>
          </div>

          <OptionGroup
            label="Energy"
            options={ENERGY}
            value={draft.energy}
            onChange={(v) => onChange({ ...draft, energy: v })}
          />

          <OptionGroup
            label="Momentum"
            options={PACE}
            value={draft.pace}
            onChange={(v) => onChange({ ...draft, pace: v })}
          />

          <OptionGroup
            label="Presence"
            options={BODY}
            value={draft.body}
            onChange={(v) => onChange({ ...draft, body: v })}
          />

          <OptionGroup
            label="Focus"
            options={MIND}
            value={draft.mind}
            onChange={(v) => onChange({ ...draft, mind: v })}
          />
        </div>
      </Card>

      <div style={{ height: 16 }} />

      <Card>
        <div style={{ display: "grid", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Signal</h3>

          <TextPromptSection
            label="What mattered today?"
            placeholder="one line is enough"
            value={draft.todaySignal}
            onChange={(v) => onChange({ ...draft, todaySignal: v })}
          />
        </div>
      </Card>

      <div style={{ height: 16 }} />

      <Card>
        <div style={{ display: "grid", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Friction</h3>

          <TextPromptSection
            label="What got in the way?"
            placeholder="optional"
            value={draft.blocker}
            onChange={(v) => onChange({ ...draft, blocker: v })}
          />
        </div>
      </Card>

      <div style={{ height: 16 }} />

      <Card>
        <div style={{ display: "grid", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Tomorrow</h3>

          <TextPromptSection
            label="What’s the smallest thing you’ll do first tomorrow?"
            placeholder="start with something small"
            value={draft.tomorrowStart}
            onChange={(v) => onChange({ ...draft, tomorrowStart: v })}
            required
          />
        </div>
      </Card>

      <div style={{ height: 16 }} />

      <Card>
        <div style={{ display: "grid", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Work</h3>

          <WorkSection
            value={draft.work}
            onChange={(work) => onChange({ ...draft, work })}
          />
        </div>
      </Card>

      <div className={styles.row}>
        <Button
          label="Back"
          onClick={onBack}
          kind="secondary"
          disabled={submitting}
        />

        <div style={{ width: 10 }} />

        <Button
          label={submitting ? "Reflecting..." : "Record Reflection"}
          onClick={() => { mediumHaptic(); onNext(); }}
          kind="primary"
          disabled={!complete || submitting}
        />
      </div>

      {!complete ? (
        <div className="small" style={{ marginTop: 8 }}>
          Energy, Momentum, and tomorrow start required
        </div>
      ) : null}

      <div
        className="small"
        style={{
          marginTop: 10,
          opacity: submitting ? 1 : 0.7,
          transition: "opacity 300ms ease",
        }}
      >
        {submitting
          ? "Reflection recorded. Returning to the mirror..."
          : "Clarify tomorrow. Return consistently."}
      </div>

      {/* ── State info modal ── */}
      {showStateInfo ? (
        <div
          onClick={() => setShowStateInfo(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(28,27,53,0.35)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(92vw, 480px)",
              maxHeight: "90vh",
              overflow: "auto",
              borderRadius: 24,
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              border: "1px solid rgba(255,255,255,0.90)",
              boxShadow: "0 24px 64px rgba(28,27,53,0.18)",
              position: "relative",
              padding: "32px 28px 28px",
            }}
          >
            <button
              type="button"
              aria-label="Close state info"
              onClick={() => setShowStateInfo(false)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 36,
                height: 36,
                borderRadius: 999,
                border: "1px solid rgba(28,27,53,0.15)",
                background: "rgba(255,255,255,0.80)",
                color: "var(--text)",
                fontSize: 18,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>

            <h2 style={{ margin: "0 0 20px", fontSize: 20, color: "var(--text)" }}>
              Understanding State
            </h2>

            {(
              [
                {
                  heading: "Energy",
                  description: "How much energy you have available today.",
                  items: [
                    { label: "Low", detail: "Running on limited energy." },
                    { label: "Steady", detail: "Sustainable energy." },
                    { label: "High", detail: "Energized and active." },
                  ],
                },
                {
                  heading: "Momentum",
                  description: "How easily you're moving through today.",
                  items: [
                    { label: "Low", detail: "Progress feels difficult." },
                    { label: "Steady", detail: "Progress feels manageable." },
                    { label: "High", detail: "Progress feels effortless." },
                  ],
                },
                {
                  heading: "Presence",
                  description: "How your body feels as you move through today.",
                  items: [
                    { label: "Relaxed", detail: "Calm and at ease." },
                    { label: "Content", detail: "Present and carrying today comfortably." },
                    { label: "Tense", detail: "Carrying pressure or anticipation." },
                  ],
                },
                {
                  heading: "Focus",
                  description: "Where your attention naturally settles today.",
                  items: [
                    { label: "Narrow", detail: "Concentrated on one thing." },
                    { label: "Wide", detail: "Spread across multiple things." },
                    { label: "Scattered", detail: "Pulled in many directions." },
                  ],
                },
              ] as const
            ).map((section) => (
              <div key={section.heading} style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", marginBottom: 4 }}>
                  {section.heading}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
                  {section.description}
                </div>
                <ul style={{ margin: 0, padding: "0 0 0 4px", listStyle: "none", display: "grid", gap: 4 }}>
                  {section.items.map((item) => (
                    <li key={item.label} style={{ fontSize: 13, color: "var(--text)" }}>
                      <span style={{ fontWeight: 600 }}>{item.label}</span>
                      {" → "}
                      {item.detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}