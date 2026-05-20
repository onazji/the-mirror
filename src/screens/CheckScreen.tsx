import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { OptionGroup } from "../components/OptionGroup";
import { TextPromptSection } from "../components/TextPromptSection";

import type { MirrorDraft, Energy, Pace, Body, Mind } from "../types/mirror";

import styles from "./CheckScreen.module.css";
import { SeerSection } from "../components/SeerSection";
import { WorkSection } from "../components/WorkSection";
import { AttentionSection } from "../components/AttentionSection";

type Props = {
  draft: MirrorDraft;
  onChange: (next: MirrorDraft) => void;
  onNext: () => void;
  onBack: () => void;
  submitting: boolean;
};

const ENERGY: readonly Energy[] = ["low", "steady", "high"] as const;
const PACE: readonly Pace[] = ["low", "steady", "high"] as const;
const BODY: readonly Body[] = ["relaxed", "tense"] as const;
const MIND: readonly Mind[] = ["narrow", "wide", "scattered"] as const;

export function CheckScreen({
  draft,
  onChange,
  onNext,
  onBack,
  submitting,
}: Props) {
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
          <h3 style={{ margin: 0 }}>State</h3>

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

      <div style={{ height: 16 }} />

      <Card>
        <div style={{ display: "grid", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Attention</h3>

          <AttentionSection
            value={draft.attention}
            onChange={(attention) => onChange({ ...draft, attention })}
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
          onClick={onNext}
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
    </div>
  );
}