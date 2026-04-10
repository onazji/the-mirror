import { Card } from "../components/Card";
import { Button } from "../components/Button";
import type { MirrorSession } from "../types/mirror";
import { formatTimeAgo, missedDaysSince } from "../services/timeFormat";
import styles from "./HomeScreen.module.css";
type Props = {
sessions: MirrorSession[];
onStart: () => void;
};
function getPatternInsight(entries: MirrorSession[]): string | null {
if (entries.length < 7) return null;
const recent = entries.slice(-7);
const latest = recent[recent.length - 1];
const previous = recent[recent.length - 2];
let familyMatches = 0;
for (let i = 0; i < recent.length - 1; i++) {
const entry = recent[i];
let matches = 0;
if (entry.energy === latest.energy) matches++;
if (entry.urgency === latest.urgency) matches++;
if (entry.body === latest.body) matches++;
if (entry.mind === latest.mind) matches++;
if (matches >= 2) {
familyMatches++;
}
}
if (familyMatches >= 3) {
return "This has been showing up a bit";
}
let differences = 0;
if (previous.energy !== latest.energy) differences++;
if (previous.urgency !== latest.urgency) differences++;
if (previous.body !== latest.body) differences++;
if (previous.mind !== latest.mind) differences++;
if (differences >= 2) {
return "Something feels different";
}
return null;
}
export function HomeScreen({ sessions, onStart }: Props) {
const last = sessions.length ? sessions[sessions.length - 1] : null;
const now = Date.now();
const lastCheckText = last ? formatTimeAgo(now, last.timestamp) : "No check-ins yet";
const missedDays = last ? missedDaysSince(now, last.timestamp) : 0;
const history = [...sessions].reverse();
const insight = getPatternInsight(sessions);
return (
<div className="container">
<h1>The Mirror</h1>
<Card title="Last check-in">
<div className={styles.bigLine}>{lastCheckText}</div>
{last ? (
<>
<div className="hr" />
<div className={styles.grid}>
<div className={styles.item}>
<span className={styles.k}>Energy</span>
<span className={styles.v}>{last.energy}</span>
</div>
<div className={styles.item}>
<span className={styles.k}>Urgency</span>
<span className={styles.v}>{last.urgency}</span>
</div>
<div className={styles.item}>
<span className={styles.k}>Body</span>
<span className={styles.v}>{last.body}</span>
</div>
<div className={styles.item}>
<span className={styles.k}>Mind</span>
<span className={styles.v}>{last.mind}</span>
</div>
</div>
{insight ? (
<>
<div className="hr" />
<div className={styles.insight}>{insight}</div>
</>
) : null}
</>
) : (
<div className="small" style={{ marginTop: 10 }}>
No state recorded yet.
</div>
)}
</Card>
{last && missedDays >= 1 ? (
<div className={styles.notice}>
{`No check-ins recorded for ${missedDays} days. State awareness resumes anytime.`}
</div>
) : null}
{history.length > 0 ? (
<>
<div style={{ height: 16 }} />
<Card title="History">
<div className={styles.historyList}>
{history.map((entry) => (
<div key={entry.id} className={styles.historyRow}>
<div className={styles.historyTime}>
{formatTimeAgo(now, entry.timestamp)}
</div>
<div className={styles.historyValues}>
{entry.energy} / {entry.urgency} / {entry.body} / {entry.mind}
</div>
</div>
))}
</div>
</Card>
</>
) : null}
<div style={{ height: 16 }} />
<Button label="Check State" onClick={onStart} kind="primary" />
<div className="small" style={{ marginTop: 10 }}>
On-device only. Stored in localStorage.
</div>
</div>
);
}