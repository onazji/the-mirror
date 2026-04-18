import { useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { StateMap } from "../components/StateMap";
import type { MirrorSession } from "../types/mirror";
import { formatTimeAgo, missedDaysSince } from "../services/timeFormat";
import { getBaseState } from "../services/stateEngine";
import { fieldLines } from "../types/fieldLines";
import styles from "./HomeScreen.module.css";

type Props = {
  sessions: MirrorSession[];
  onStart: () => void;
};

function getEnergyLine(current: string): string {
  if (current === "high") return "My energy feels higher";
  if (current === "low") return "My energy feels lower";
  return "My energy feels steady";
}

function getPaceLine(current: string): string {
  if (current === "high") return "My pace feels higher";
  if (current === "low") return "My pace feels lower";
  return "My pace feels steady";
}

function getBodyLine(current: string): string {
  if (current === "tense") return "My body feels more tense";
  if (current === "relaxed") return "My body feels more relaxed";
  return "My body feels different";
}

function getMindLine(current: string): string {
  if (current === "narrow") return "My focus feels narrower";
  if (current === "wide") return "My focus feels wider";
  if (current === "scattered") return "My thoughts feel more scattered";
  return "My mind feels different";
}

function getPatternInsight(entries: MirrorSession[]): string | null {
  if (entries.length < 2) return null;

  const latest = entries[entries.length - 1];
  const previous = entries[entries.length - 2];

  const changes: { priority: number; line: string }[] = [];

  if (latest.body !== previous.body) {
    changes.push({
      priority: 1,
      line: getBodyLine(latest.body),
    });
  }

  if (latest.mind !== previous.mind) {
    changes.push({
      priority: 2,
      line: getMindLine(latest.mind),
    });
  }

  if (latest.energy !== previous.energy) {
    changes.push({
      priority: 3,
      line: getEnergyLine(latest.energy),
    });
  }

  if (latest.pace !== previous.pace) {
    changes.push({
      priority: 4,
      line: getPaceLine(latest.pace),
    });
  }

  if (changes.length === 0) {
    return null;
  }

  if (changes.length === 1) {
    return changes[0].line;
  }

  changes.sort((a, b) => a.priority - b.priority);
  return changes[0].line;
}

export function HomeScreen({ sessions, onStart }: Props) {
  const [showInfo, setShowInfo] = useState(false);

  const last = sessions.length ? sessions[sessions.length - 1] : null;
  const now = Date.now();

  const lastCheckText = last ? formatTimeAgo(now, last.timestamp) : "No check-ins yet";
  const missedDays = last ? missedDaysSince(now, last.timestamp) : 0;
  const history = [...sessions].reverse();
  const insight = getPatternInsight(sessions);

  const baseState = last ? getBaseState(last.energy, last.pace) : null;
  const fieldLine = baseState ? fieldLines[baseState] : null;

  return (
    <>
      <div className="container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <h1 style={{ margin: 0 }}>The Mirror</h1>

          <button
            type="button"
            aria-label="Open state map explanation"
            onClick={() => setShowInfo(true)}
            style={{
              border: "1px solid rgba(255,255,255,0.16)",
              background: "transparent",
              color: "var(--text)",
              width: 36,
              height: 36,
              borderRadius: 999,
              cursor: "pointer",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            ⓘ
          </button>
        </div>

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
                  <span className={styles.k}>Pace</span>
                  <span className={styles.v}>{last.pace}</span>
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

              {insight || fieldLine ? (
                <>
                  <div className="hr" />
                  {insight ? <div className={styles.insight}>{insight}</div> : null}
                  {fieldLine ? (
                    <div
                      style={{
                        marginTop: insight ? 8 : 0,
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: "var(--muted)",
                      }}
                    >
                      {fieldLine}
                    </div>
                  ) : null}
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
  <div style={{ fontWeight: 600 }}>
    {getBaseState(entry.energy, entry.pace)}
  </div>
  <div style={{ opacity: 0.7, fontSize: 13 }}>
    {entry.body} • {entry.mind}
  </div>
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

      {showInfo ? (
        <div
          onClick={() => setShowInfo(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
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
              width: "min(92vw, 820px)",
              maxHeight: "90vh",
              overflow: "auto",
              borderRadius: 20,
              background: "#ffffff",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              position: "relative",
            }}
          >
            <button
              type="button"
              aria-label="Close state map"
              onClick={() => setShowInfo(false)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 36,
                height: 36,
                borderRadius: 999,
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#111827",
                fontSize: 18,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <StateMap
              energy={(last?.energy as "low" | "steady" | "high") ?? "steady"}
              pace={(last?.pace as "low" | "steady" | "high") ?? "steady"}
              body={(last?.body as "tense" | "relaxed") ?? "relaxed"}
              mind={(last?.mind as "narrow" | "wide" | "scattered") ?? "wide"}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}