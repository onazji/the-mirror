
import { useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { StateMap } from "../components/StateMap";
import { CardRevealOverlay } from "../components/CardRevealOverlay";
import type { MirrorSession, PreviousStartResult } from "../types/mirror";
import { formatTimeAgo, missedDaysSince } from "../services/timeFormat";
import { getMirrorCard } from "../services/cardEngine";
import { buildWeeklyLayer } from "../services/weeklyLayer";
import { buildResetLine } from "../services/nextStepEngine";
import styles from "./HomeScreen.module.css";

type Props = {
  sessions: MirrorSession[];
  onStart: () => void;
  onResult: (sessionId: string, result: PreviousStartResult) => void;
};

function renderWorkSummary(work: MirrorSession["work"]): string {
  const parts = [
    work.app ? "App" : null,
    work.game ? "Game" : null,
    work.output ? "Other" : null,
  ].filter(Boolean);

  const summary = parts.length > 0 ? parts.join(" · ") : "None";
  return `${summary} (${work.sessions})`;
}

function renderResultLabel(result: PreviousStartResult): string {
  if (result === "yes") return "Yes";
  if (result === "partial") return "Partially";
  return "No";
}

export function HomeScreen({ sessions, onStart, onResult }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const [showCardReveal, setShowCardReveal] = useState(false);

  const last = sessions.length ? sessions[sessions.length - 1] : null;
  const now = Date.now();

  const lastCheckText = last
    ? formatTimeAgo(now, last.timestamp)
    : "No reflections yet";

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

        <div style={{ height: 16 }} />

        <Button label="Step Into the Mirror" onClick={onStart} kind="primary" />

        <Card title="Last reflection">
          <div className={styles.bigLine}>{lastCheckText}</div>

          {last?.tomorrowStart ? (
            <>
              <div className="hr" />

              <div style={{ display: "grid", gap: 6 }}>
                <div className="small">Tomorrow starts here</div>

                <div style={{ fontWeight: 700 }}>→ {last.tomorrowStart}</div>

                <div style={{ fontSize: 14, opacity: 0.75 }}>
                  {buildResetLine(last.energy, last.pace, last.tomorrowStart)}
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <div className="small">Did you do this?</div>

                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  {(["yes", "partial", "no"] as const).map((result) => {
                    const active = last.previousStartResult === result;

                    return (
                      <button
                        key={result}
                        type="button"
                        onClick={() => onResult(last.id, result)}
                        style={{
                          minHeight: 44,
                          padding: "10px 14px",
                          borderRadius: 14,
                          border: active
                            ? "1px solid rgba(191, 164, 90, 0.85)"
                            : "1px solid rgba(255,255,255,0.12)",
                          background: active
                            ? "rgba(191, 164, 90, 0.12)"
                            : "transparent",
                          color: "var(--text)",
                          boxShadow: active
                            ? "0 0 0 1px rgba(191, 164, 90, 0.18) inset"
                            : "none",
                          cursor: "pointer",
                          transition: "all 120ms ease",
                        }}
                      >
                        {result === "yes"
                          ? "Yes"
                          : result === "partial"
                          ? "Partially"
                          : "No"}
                      </button>
                    );
                  })}
                </div>

                {last.previousStartResult ? (
                  <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>
                    Last result: {renderResultLabel(last.previousStartResult)}
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          {last ? (
            <>
              <div className="hr" />

              <div className={styles.grid}>
                <div className={styles.item}>
                  <span className={styles.k}>Energy</span>
                  <span className={styles.v}>{last.energy}</span>
                </div>

                <div className={styles.item}>
                  <span className={styles.k}>Momentum</span>
                  <span className={styles.v}>{last.pace}</span>
                </div>

                <div className={styles.item}>
                  <span className={styles.k}>Presence</span>
                  <span className={styles.v}>{last.body}</span>
                </div>

                <div className={styles.item}>
                  <span className={styles.k}>Focus</span>
                  <span className={styles.v}>{last.mind}</span>
                </div>
              </div>

              {card ? (
                <>
                  <div className="hr" />

                  <button
                    type="button"
                    onClick={() => setShowCardReveal(true)}
                    style={{
                      width: "100%",
                      border: "1px solid rgba(255,255,255,0.16)",
                      background: "rgba(255,255,255,0.06)",
                      color: "var(--text)",
                      borderRadius: 16,
                      padding: "14px 16px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.65,
                        marginBottom: 4,
                      }}
                    >
                      Reflection
                    </div>

                    <div style={{ fontWeight: 700 }}>{card.title}</div>

                    <div style={{ marginTop: 4, fontSize: 14, opacity: 0.75 }}>
                      See the card
                    </div>
                  </button>
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

                {last.todaySignal ? (
                  <div>
                    <strong>Signal:</strong> {last.todaySignal}
                  </div>
                ) : null}

                {last.blocker ? (
                  <div>
                    <strong>Friction:</strong> {last.blocker}
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="small" style={{ marginTop: 10 }}>
              No reflection recorded yet.
            </div>
          )}
        </Card>

        {last && missedDays >= 1 ? (
          <div className={styles.notice}>
            {`No reflections recorded for ${missedDays} days. You can return anytime.`}
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
                  <strong>SEER:</strong> Held {weekly.seerHeld} · Partial{" "}
                  {weekly.seerPartial} · Missed {weekly.seerMissed}
                </div>

                <div>
                  <strong>Work:</strong> App {weekly.appSessions} · Game{" "}
                  {weekly.gameSessions} · Other {weekly.outputSessions}
                </div>

                <div>
                  <strong>Most common state:</strong>{" "}
                  {weekly.mostCommonCard ?? "None"}
                </div>

                <div>
                  <strong>Attention:</strong> Waste{" "}
                  {weekly.attentionCounts.waste} · Bugs{" "}
                  {weekly.attentionCounts.bugs} · Features{" "}
                  {weekly.attentionCounts.features} · Brainstorm{" "}
                  {weekly.attentionCounts.brainstorm}
                </div>

                {weekly.stateInsight ||
                weekly.attentionInsight ||
                weekly.seerInsight ? (
                  <>
                    <div className="hr" />

                    {weekly.stateInsight ? (
                      <div style={{ fontSize: 14 }}>{weekly.stateInsight}</div>
                    ) : null}

                    {weekly.attentionInsight ? (
                      <div style={{ fontSize: 14 }}>
                        {weekly.attentionInsight}
                      </div>
                    ) : null}

                    {weekly.seerInsight ? (
                      <div style={{ fontSize: 14 }}>{weekly.seerInsight}</div>
                    ) : null}
                  </>
                ) : null}

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
                        <div style={{ fontWeight: 600 }}>{entryCard.title}</div>

                        <div style={{ opacity: 0.7, fontSize: 13 }}>
                          {entry.body} • {entry.mind}
                        </div>

                        {entry.tomorrowStart ? (
                          <div style={{ marginTop: 4, fontSize: 13 }}>
                            <strong>Next:</strong> {entry.tomorrowStart}
                          </div>
                        ) : null}

                        {entry.previousStartResult ? (
                          <div style={{ fontSize: 13 }}>
                            <strong>Result:</strong>{" "}
                            {renderResultLabel(entry.previousStartResult)}
                          </div>
                        ) : null}

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

        <div className="small" style={{ marginTop: 10 }}>
          On-device only. Stored in localStorage.
        </div>
      </div>

      {showCardReveal && card ? (
        <CardRevealOverlay
          card={card}
          onClose={() => setShowCardReveal(false)}
        />
      ) : null}

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