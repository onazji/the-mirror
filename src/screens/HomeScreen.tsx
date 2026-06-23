import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { StateMap } from "../components/StateMap";
import { CardRevealOverlay } from "../components/CardRevealOverlay";
import { LivingMirrorArtifact } from "../components/LivingMirrorArtifact";
import type { MirrorSession, PreviousStartResult } from "../types/mirror";
import { formatTimeAgo, missedDaysSince } from "../services/timeFormat";
import { getMirrorCard } from "../services/cardEngine";
import { buildWeeklyLayer } from "../services/weeklyLayer";
import { buildResetLine } from "../services/nextStepEngine";
import { computeArtifactStats } from "../services/artifactEngine";
import styles from "./HomeScreen.module.css";

type Props = {
  sessions: MirrorSession[];
  onStart: () => void;
  onResult: (sessionId: string, result: PreviousStartResult) => void;
};

function renderWorkSummary(work: MirrorSession["work"]): string {
  const parts = [
    work.app ? "Personal" : null,
    work.game ? "Professional" : null,
    work.creative ? "Creative" : null,
    work.physical ? "Physical" : null,
    work.output ? "Other" : null,
  ].filter(Boolean);
  const summary = parts.length > 0 ? parts.join(" · ") : "None";
  return `${summary} · ${work.sessions} session${work.sessions !== 1 ? "s" : ""}`;
}

function renderResultLabel(result: PreviousStartResult): string {
  if (result === "yes") return "Yes";
  if (result === "partial") return "Partially";
  return "No";
}

export function HomeScreen({ sessions, onStart, onResult }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const [showCardReveal, setShowCardReveal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const last = sessions.length ? sessions[sessions.length - 1] : null;
  const now = Date.now();

  const lastCheckText = last ? formatTimeAgo(now, last.timestamp) : "No reflections yet";
  const missedDays = last ? missedDaysSince(now, last.timestamp) : 0;
  const history = [...sessions].reverse();
  const card = last ? getMirrorCard(last.energy, last.pace) : null;
  const weekly = buildWeeklyLayer(sessions, now);
  const artifact = computeArtifactStats(sessions, now);

  return (
    <>
      <div className="container">

        {/* ── Header ── */}
        <div className={styles.header}>
          <LivingMirrorArtifact stats={artifact} />
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>The Mirror</h1>
            <div className={styles.tagline}>Pause. Reflect. Choose your direction.</div>
          </div>
          <button
            type="button"
            className={styles.infoBtn}
            aria-label="Open state map"
            onClick={() => setShowInfo(true)}
          >
            ⓘ
          </button>
        </div>

        <div style={{ height: 20 }} />

        {/* ── CTA ── */}
        <Button label="Step Into the Mirror" onClick={onStart} kind="primary" />

        <div style={{ height: 16 }} />

        {/* ── Last Reflection ── */}
        <Card title="Last reflection">
          <div className={styles.bigLine}>{lastCheckText}</div>
          {!last && (
            <div className={styles.subLine}>Complete your first check-in to get started.</div>
          )}

          {last?.tomorrowStart ? (
            <>
              <div className="hr" />
              <div className={styles.tomorrowBlock}>
                <div className={styles.tomorrowLabel}>Tomorrow starts here</div>
                <div className={styles.tomorrowText}>→ {last.tomorrowStart}</div>
                <div className={styles.tomorrowHint}>
                  {buildResetLine(last.energy, last.pace, last.tomorrowStart)}
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <div className={styles.tomorrowLabel}>Did you do this?</div>
                <div className={styles.resultRow}>
                  {(["yes", "partial", "no"] as const).map((result) => {
                    const active = last.previousStartResult === result;
                    return (
                      <button
                        key={result}
                        type="button"
                        onClick={() => onResult(last.id, result)}
                        className={`${styles.resultBtn} ${active ? styles.resultBtnActive : ""}`}
                      >
                        {result === "yes" ? "Yes" : result === "partial" ? "Partially" : "No"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}

          {last ? (
            <>
              <div className="hr" />

              {/* State grid */}
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

              {/* Reflection card */}
              {card ? (
                <>
                  <div className="hr" />
                  <button
                    type="button"
                    className={styles.reflectionBtn}
                    onClick={() => setShowCardReveal(true)}
                  >
                    <div className={styles.reflectionKicker}>Reflection</div>
                    <div className={styles.reflectionTitle}>{card.title}</div>
                    <div className={styles.reflectionCta}>Tap to see the card →</div>
                  </button>
                </>
              ) : null}

              {/* Session detail */}
              <div className="hr" />
              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Show Up</span>
                  <div className={styles.seerPills}>
                    <span className={`${styles.seerPill} ${last.seer.anchor ? styles.seerPillHeld : styles.seerPillMissed}`}>
                      {last.seer.anchor ? "What mattered ✓" : "What mattered ✗"}
                    </span>
                    <span className={`${styles.seerPill} ${last.seer.integrity ? styles.seerPillHeld : styles.seerPillMissed}`}>
                      {last.seer.integrity ? "Stayed true ✓" : "Stayed true ✗"}
                    </span>
                  </div>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Work</span>
                  <span className={styles.detailValue}>{renderWorkSummary(last.work)}</span>
                </div>
                {last.work.note ? (
                  <div className={styles.detailRow} style={{ paddingLeft: 70 }}>
                    <span style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>{last.work.note}</span>
                  </div>
                ) : null}
                {last.todaySignal ? (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Signal</span>
                    <span className={styles.detailValue}>{last.todaySignal}</span>
                  </div>
                ) : null}
                {last.blocker ? (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Friction</span>
                    <span className={styles.detailValue}>{last.blocker}</span>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </Card>

        {/* ── Missed days notice ── */}
        {last && missedDays >= 1 ? (
          <div className={styles.notice}>
            {`${missedDays} day${missedDays > 1 ? "s" : ""} since your last reflection. You can return anytime.`}
          </div>
        ) : null}

        {/* ── Weekly ── */}
        {weekly.totalEntries > 0 ? (
          <>
            <div style={{ height: 16 }} />
            <Card title="This week">
              <div style={{ display: "grid", gap: 6 }}>
                <div className={styles.weeklyRow}>
                  <span className={styles.weeklyLabel}>Entries</span>
                  <span className={styles.weeklyValue}>{weekly.totalEntries}</span>
                </div>
                <div className={styles.weeklyRow}>
                  <span className={styles.weeklyLabel}>Show Up</span>
                  <span className={styles.weeklyValue}>
                    {weekly.seerHeld} yes · {weekly.seerPartial} partial · {weekly.seerMissed} no
                  </span>
                </div>
                <div className={styles.weeklyRow}>
                  <span className={styles.weeklyLabel}>Work</span>
                  <span className={styles.weeklyValue}>
                    Personal {weekly.appSessions} · Professional {weekly.gameSessions} · Creative {weekly.creativeSessions} · Physical {weekly.physicalSessions} · Other {weekly.outputSessions}
                  </span>
                </div>
                <div className={styles.weeklyRow}>
                  <span className={styles.weeklyLabel}>Top state</span>
                  <span className={styles.weeklyValue}>{weekly.mostCommonCard ?? "—"}</span>
                </div>
                {(weekly.stateInsight || weekly.seerInsight) ? (
                  <>
                    <div className="hr" />
                    {[weekly.stateInsight, weekly.seerInsight]
                      .filter(Boolean)
                      .map((insight, i) => (
                        <div key={i} className={styles.insightText}>{insight}</div>
                      ))}
                  </>
                ) : null}

                {weekly.finalLine ? (
                  <div className={styles.insightText} style={{ marginTop: 4 }}>
                    {weekly.finalLine}
                  </div>
                ) : null}
              </div>
            </Card>
          </>
        ) : null}

        {/* ── History ── */}
        {history.length > 0 ? (
          <>
            <div style={{ height: 16 }} />
            <Card title="History">
              <div className={styles.historyList}>
                {history.map((entry) => {
                  const entryCard = getMirrorCard(entry.energy, entry.pace);
                  return (
                    <div key={entry.id} className={styles.historyRow}>
                      <div className={styles.historyTime}>{formatTimeAgo(now, entry.timestamp)}</div>
                      <div className={styles.historyCard}>{entryCard.title}</div>
                      <div className={styles.historyMeta}>
                        {entry.energy} energy · {entry.body} · {entry.mind}
                      </div>
                      {entry.tomorrowStart ? (
                        <div className={styles.historyNext}>
                          → {entry.tomorrowStart}
                          {entry.previousStartResult ? ` · ${renderResultLabel(entry.previousStartResult)}` : ""}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        ) : null}

        <div className={styles.footer}>On-device only · Stored in localStorage</div>
      </div>

      {/* ── Card reveal overlay ── */}
      {showCardReveal && card ? (
        <CardRevealOverlay card={card} onClose={() => setShowCardReveal(false)} />
      ) : null}

      {/* ── State map modal ── */}
      {showInfo ? (
        <div
          onClick={() => setShowInfo(false)}
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
              width: "min(92vw, 820px)",
              maxHeight: "90vh",
              overflow: "auto",
              borderRadius: 24,
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              border: "1px solid rgba(255,255,255,0.90)",
              boxShadow: "0 24px 64px rgba(28,27,53,0.18)",
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
            <StateMap
              energy={(last?.energy as "low" | "steady" | "high") ?? "steady"}
              pace={(last?.pace as "low" | "steady" | "high") ?? "steady"}
              body={(last?.body as "tense" | "content" | "relaxed") ?? "relaxed"}
              mind={(last?.mind as "narrow" | "wide" | "scattered") ?? "wide"}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
