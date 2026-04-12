import styles from "./StateMap.module.css";
import { getBaseState, type BaseStateName } from "../services/stateEngine";
type Level = "low" | "steady" | "high";
type BodyState = "tense" | "relaxed";
type MindState = "narrow" | "wide" | "scattered";
type Props = {
energy?: Level;
urgency?: Level;
body?: BodyState;
mind?: MindState;
};
const bodyPositionMap: Record<BodyState, string> = {
tense: "25%",
relaxed: "75%",
};
const baseStateGrid: { energy: Level; urgency: Level; label: BaseStateName }[] = [
{ energy: "high", urgency: "low", label: "Drift" },
{ energy: "high", urgency: "steady", label: "Flow" },
{ energy: "high", urgency: "high", label: "Overdrive" },
{ energy: "steady", urgency: "low", label: "Idle" },
{ energy: "steady", urgency: "steady", label: "Alignment" },
{ energy: "steady", urgency: "high", label: "Pressure" },
{ energy: "low", urgency: "low", label: "Stagnant" },
{ energy: "low", urgency: "steady", label: "Patience" },
{ energy: "low", urgency: "high", label: "Anxiety" },
];
export function StateMap({
energy = "steady",
urgency = "steady",
body = "relaxed",
mind = "wide",
}: Props) {
const activeBaseState = getBaseState(energy, urgency);
return (
<section className={styles.wrapper} aria-label="State map">
<h2 className={styles.title}>The Mirror</h2>
<p className={styles.subtitle}>4 Signals. One State.</p>
<div className={styles.matrixBlock}>
<div className={styles.axisTopTitle}>Urgency</div>
<div className={styles.colLabels}>
<div className={styles.cornerSpacer} />
<div className={styles.colLabel}>Low</div>
<div className={styles.colLabel}>Steady</div>
<div className={styles.colLabel}>High</div>
</div>
<div className={styles.matrixRow}>
<div className={styles.yAxisArea}>
<div className={styles.yAxisTitle}>Energy</div>
<div className={styles.rowLabels}>
<div className={styles.rowLabel}>High</div>
<div className={styles.rowLabel}>Steady</div>
<div className={styles.rowLabel}>Low</div>
</div>
</div>
<div className={styles.grid} aria-label="Energy and urgency state grid">
{baseStateGrid.map((cell) => {
const isActive = cell.label === activeBaseState;
return (
<div
key={`${cell.energy}-${cell.urgency}`}
className={`${styles.cell} ${isActive ? styles.cellActive : ""}`}
>
<span
className={`${styles.cellLabel} ${
isActive ? styles.cellLabelActive : ""
}`}
>
{cell.label}
</span>
</div>
);
})}
</div>
</div>
</div>
<div className={styles.section}>
<div className={styles.sectionTitle}>Body</div>
<div className={styles.bodyRow}>
<span className={styles.bodyLabel}>Tense</span>
<div className={styles.bodyTrack}>
<div
className={styles.bodyDot}
style={{ left: bodyPositionMap[body] }}
/>
</div>
<span className={styles.bodyLabel}>Relaxed</span>
</div>
</div>
<div className={styles.section}>
<div className={styles.sectionTitle}>Mind</div>
<div className={styles.mindRow}>
<span className={`${styles.mindLabel} ${mind === "narrow" ? styles.mindActive : ""}`}>
Narrow
</span>
<span className={`${styles.mindLabel} ${mind === "wide" ? styles.mindActive : ""}`}>
Wide
</span>
<span className={`${styles.mindLabel} ${mind === "scattered" ? styles.mindActive :
""}`}>
Scattered
</span>
</div>
</div>
<p className={styles.footer}>
Your state shapes your thoughts, actions, and results.
</p>
</section>
);
}