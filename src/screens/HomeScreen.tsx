import { Card } from "../components/Card";
import { Button } from "../components/Button";
import type { MirrorSession } from "../types/mirror";
import { formatTimeAgo, missedDaysSince } from "../services/timeFormat";
import styles from "./HomeScreen.module.css";

type Props = {
  sessions: MirrorSession[];
  onStart: () => void;
};

export function HomeScreen({ sessions, onStart }: Props) {
  const last = sessions.length ? sessions[sessions.length - 1] : null;
  const now = Date.now();

  const lastCheckText = last ? formatTimeAgo(now, last.timestamp) : "No check-ins yet";
  const missedDays = last ? missedDaysSince(now, last.timestamp) : 0;
  //added history function
  const history = [...sessions].reverse();

  return (
    <div className="container">
      <h1>The Mirror</h1>

      <Card title="Last check-in">
        <div className={styles.bigLine}>{lastCheckText}</div>

        {last ? (
          <>
            <div className="hr" />
            <div className={styles.grid}>
              <div className={styles.item}><span className={styles.k}>Energy</span><span className={styles.v}>{last.energy}</span></div>
              <div className={styles.item}><span className={styles.k}>Urgency</span><span className={styles.v}>{last.urgency}</span></div>
              <div className={styles.item}><span className={styles.k}>Body</span><span className={styles.v}>{last.body}</span></div>
              <div className={styles.item}><span className={styles.k}>Mind</span><span className={styles.v}>{last.mind}</span></div>
            </div>
          </>
        ) : (
          <div className="small" style={{ marginTop: 10 }}>No state recorded yet.</div>
        )}
      </Card>

      {last && missedDays >= 1 ? (
        <div className={styles.notice}>
          {'No check-ins recorded for  days. State awareness resumes anytime.'}
        </div>
      ) : null}


        {history.length > 0?(
          <>
            <div style={{height: 16}} />
              <Card title = "History">
  <div className={styles.historyList}>
    {history.map((entry)=>(
      <div key = {entry.id} className = {styles.historyRow}>
        <div className = {styles.historyTime}>
          {formatTimeAgo(now,entry.timestamp)}
          </div>
          <div className = {styles.historyValues}>

          {entry.energy} / {entry.urgency} / {entry.body} / {entry.mind}
          </div>
</div>
        ))}
</div>
</Card>
</>
): null}



























      <div style={{ height: 16 }} />

      <Button label="Check State" onClick={onStart} kind="primary" />
      <div className="small" style={{ marginTop: 10 }}>
        On-device only. Stored in localStorage.
      </div>
    </div>
  );
}
