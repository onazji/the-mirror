import { useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { StateMap } from "../components/StateMap";
import type { MirrorSession } from "../types/mirror";
import { formatTimeAgo, missedDaysSince } from "../services/timeFormat";
import { getMirrorCard } from "../services/cardEngine";
import { buildWeeklyLayer } from "../services/weeklyLayer";
import styles from "./HomeScreen.module.css";

type Props = {
  sessions: MirrorSession[];
  onStart: () => void;
};

function renderWorkSummary(work: MirrorSession["work"]): string {
  const parts = [
    work.app ? "App" : null,
    work.game ? "Game" : null,
    work.output ? "Output" : null,
  ].filter(Boolean);

  const summary = parts.length > 0 ? parts.join(" · ") : "None";
  return `${summary} (${work.sessions})`;
}

export function HomeScreen({ sessions, onStart }: Props) {
  const [showInfo, setShowInfo] = useState(false);

  const last = sessions.length ? sessions[sessions.length - 1] : null;
  const now = Date.now();

  const lastCheckText = last ? formatTimeAgo(now, last.timestamp) : "No check-ins yet";
  const missedDays = last ? missedDaysSince(now, last.timestamp) : 0;
  const history = [...sessions].reverse();

  const card = last ? getMirrorCard(last.energy, last.pace) : null;
  const weekly = buildWeeklyLayer(sessions, now);

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

              {card ? (
                <>
                  <div className="hr" />
                  <div className={styles.insight}>
                    <div style={{ fontWeight: 700 }}>{card.title}</div>
                    <div style={{ marginTop: 6 }}>{card.line}</div>
                  </div>
                </>
              ) : null}

              <div className="hr" />

              <div style={{ display: "grid", gap: 8 }}>
                <div>
                  <strong>SEER:</strong>{" "}
                  {last.seer.anchor ? "Anchor ✓" : "Anchor ✗"} ·{" "}
                  {last.seer.integrity ? "Integrity ✓" : "Integrity ✗"}
                </div>

                <div>
                  <strong>Work:</strong> {renderWorkSummary(last.work)}
                </div>

                {last.work.note ? (
                  <div style={{ fontSize: 13, opacity: 0.7 }}>
                    {last.work.note}
                  </div>
                ) : null}

                <div>
                  <strong>Attention:</strong> {last.attention}
                </div>
              </div>
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

        {weekly.totalEntries > 0 ? (
          <>
            <div style={{ height: 16 }} />

            <Card title="Weekly">
              <div style={{ display: "grid", gap: 8 }}>
                <div>
                  <strong>Entries:</strong> {weekly.totalEntries}
                </div>

                <div>
                  <strong>SEER:</strong>{" "}
                  Held {weekly.seerHeld} · Partial {weekly.seerPartial} · Missed{" "}
                  {weekly.seerMissed}
                </div>

                <div>
                  <strong>Work:</strong>{" "}
                  App {weekly.appSessions} · Game {weekly.gameSessions} · Output{" "}
                  {weekly.outputSessions}
                </div>

                <div>
                  <strong>Most common state:</strong>{" "}
                  {weekly.mostCommonCard ?? "None"}
                </div>

                <div>
                  <strong>Attention:</strong>{" "}
                  Waste {weekly.attentionCounts.waste} · Bugs{" "}
                  {weekly.attentionCounts.bugs} · Features{" "}
                  {weekly.attentionCounts.features} · Brainstorm{" "}
                  {weekly.attentionCounts.brainstorm}
                </div>

                <div style={{ marginTop: 6, opacity: 0.75 }}>
                  {weekly.finalLine}
                </div>
              </div>
            </Card>
          </>
        ) : null}

        {history.length > 0 ? (
          <>
            <div style={{ height: 16 }} />
            <Card title="History">
              <div className={styles.historyList}>
                {history.map((entry) => {
                  const entryCard = getMirrorCard(entry.energy, entry.pace);

                  return (
                    <div key={entry.id} className={styles.historyRow}>
                      <div className={styles.historyTime}>
                        {formatTimeAgo(now, entry.timestamp)}
                      </div>

                      <div className={styles.historyValues}>
                        <div style={{ fontWeight: 600 }}>
                          {entryCard.title}
                        </div>

                        <div style={{ opacity: 0.7, fontSize: 13 }}>
                          {entry.body} • {entry.mind}
                        </div>

                        <div style={{ marginTop: 4, fontSize: 13 }}>
                          <strong>SEER:</strong>{" "}
                          {entry.seer.anchor ? "A✓" : "A✗"} ·{" "}
                          {entry.seer.integrity ? "I✓" : "I✗"}
                        </div>

                        <div style={{ fontSize: 13 }}>
                          <strong>Work:</strong> {renderWorkSummary(entry.work)}
                        </div>

                        {entry.work.note ? (
                          <div style={{ fontSize: 12, opacity: 0.7 }}>
                            {entry.work.note}
                          </div>
                        ) : null}

                        <div style={{ fontSize: 13 }}>
                          <strong>Attention:</strong> {entry.attention}
                        </div>
                      </div>
                    </div>
                  );
                })}
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