import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { OptionGroup } from "../components/OptionGroup";
import type { MirrorDraft, Energy, Pace, Body, Mind } from "../types/mirror";
import styles from "./CheckScreen.module.css";

type Props = {
  draft: MirrorDraft;
  onChange: (next: MirrorDraft) => void;
  onNext: () => void;
  onBack: () => void;
};

const ENERGY: readonly Energy[] = ["low", "steady", "high"] as const;
const URGENCY: readonly Pace[] = ["low", "steady", "high"] as const;
const BODY: readonly Body[] = ["relaxed", "tense"] as const;
const MIND: readonly Mind[] = ["narrow", "wide", "scattered"] as const;

export function CheckScreen({ draft, onChange, onNext, onBack }: Props) {
  const complete = !!(draft.energy && draft.pace && draft.body && draft.mind);

  return (
    <div className="container">
      <h1>Check</h1>

      <Card>
        <OptionGroup label="Energy" options={ENERGY} value={draft.energy} onChange={(v) => onChange({ ...draft, energy: v })} />
        <OptionGroup label="Pace" options={URGENCY} value={draft.pace} onChange={(v) => onChange({ ...draft, pace: v })} />
        <OptionGroup label="Body" options={BODY} value={draft.body} onChange={(v) => onChange({ ...draft, body: v })} />
        <OptionGroup label="Mind" options={MIND} value={draft.mind} onChange={(v) => onChange({ ...draft, mind: v })} />
      </Card>

      <div className={styles.row}>
        <Button label="Back" onClick={onBack} kind="secondary" />
        <div style={{ width: 10 }} />
        <Button label="Next" onClick={onNext} kind="primary" disabled={!complete} />
      </div>

      <div className="small" style={{ marginTop: 10 }}>
        Tap to choose. No sliders.
      </div>
    </div>
  );
}
