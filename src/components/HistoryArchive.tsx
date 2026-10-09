import { useEffect, useMemo, useState } from "react";
import { getMirrorCard } from "../services/cardEngine";
import {
  getHistoryAccessView,
  HISTORY_PAGE_SIZE,
  type HistoryAccessLevel,
} from "../services/historyService";
import type { MirrorSession, PreviousStartResult } from "../types/mirror";
import styles from "./HistoryArchive.module.css";

type Props = {
  sessions: MirrorSession[];
  accessLevel: HistoryAccessLevel;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function HistoryArchive({ sessions, accessLevel }: Props) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(HISTORY_PAGE_SIZE);
  const view = useMemo(
    () => getHistoryAccessView(sessions, accessLevel),
    [sessions, accessLevel]
  );
  const selectedSession = selectedSessionId
    ? view.sessions.find((session) => session.id === selectedSessionId) ?? null
    : null;

  useEffect(() => {
    setVisibleCount(HISTORY_PAGE_SIZE);
    setSelectedSessionId(null);
  }, [accessLevel]);

  if (selectedSession) {
    return (
      <ReflectionDetails
        session={selectedSession}
        onBack={() => setSelectedSessionId(null)}
      />
    );
  }

  const renderedSessions = view.sessions.slice(0, visibleCount);
  const hasMore = renderedSessions.length < view.sessions.length;

  return (
    <div>
      <div className={styles.headingRow}>
        <div>
          <div className={styles.heading}>Reflection history</div>
          <p className={styles.copy}>
            {accessLevel === "premium"
              ? "Your complete local archive, newest first."
              : "Your five most recent reflections, newest first."}
          </p>
        </div>
        <div className={styles.count} aria-label={`${view.totalCount} total reflections`}>
          {view.totalCount}
        </div>
      </div>

      {renderedSessions.length === 0 ? (
        <div className={styles.empty}>
          Your reflections will appear here after your first return.
        </div>
      ) : (
        <div className={styles.list} aria-label="Reflection archive">
          {renderedSessions.map((session) => {
            const card = getMirrorCard(session.energy, session.pace);
            return (
              <button
                key={session.id}
                type="button"
                className={styles.item}
                onClick={() => setSelectedSessionId(session.id)}
                aria-label={`Open ${card.title} reflection from ${dateFormatter.format(session.timestamp)}`}
              >
                <time dateTime={new Date(session.timestamp).toISOString()} className={styles.date}>
                  {dateFormatter.format(session.timestamp)}
                </time>
                <span className={styles.cardTitle}>{card.title}</span>
                <span className={styles.meta}>
                  {session.energy} energy · {session.pace} momentum
                </span>
                <span className={styles.openHint}>Open reflection →</span>
              </button>
            );
          })}
        </div>
      )}

      {hasMore ? (
        <button
          type="button"
          className={styles.loadMore}
          onClick={() => setVisibleCount((count) => count + HISTORY_PAGE_SIZE)}
        >
          Load older reflections
        </button>
      ) : null}

      {view.hiddenCount > 0 ? (
        <div className={styles.accessNote}>
          {view.hiddenCount} earlier reflection{view.hiddenCount === 1 ? "" : "s"} remain safely stored on this device. Mirror Premium opens the complete archive.
        </div>
      ) : null}
    </div>
  );
}

function ReflectionDetails({
  session,
  onBack,
}: {
  session: MirrorSession;
  onBack: () => void;
}) {
  const card = getMirrorCard(session.energy, session.pace);
  const activities = workActivities(session);
  const invested = formatTimeInvested(session);

  return (
    <article className={styles.details} aria-labelledby="history-detail-title">
      <button type="button" className={styles.back} onClick={onBack}>
        ← History
      </button>
      <time dateTime={new Date(session.timestamp).toISOString()} className={styles.detailDate}>
        {dateFormatter.format(session.timestamp)}
      </time>
      <h2 id="history-detail-title" className={styles.detailTitle}>{card.title}</h2>
      <p className={styles.cardLine}>{card.line}</p>

      <div className={styles.stateGrid}>
        <Detail label="Energy" value={session.energy} />
        <Detail label="Momentum" value={session.pace} />
        <Detail label="Presence" value={session.body} />
        <Detail label="Focus" value={session.mind} />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Show Up</div>
        <Detail label="What mattered" value={session.seer.anchor ? "Yes" : "No"} />
        <Detail label="Stayed true" value={session.seer.integrity ? "Yes" : "No"} />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Work</div>
        <Detail label="Activities" value={activities || "None recorded"} />
        <Detail label="Time" value={invested} />
        <Detail label="Sessions" value={String(session.work.sessions)} />
        <Detail label="Note" value={session.work.note || "Not recorded"} />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Reflection</div>
        <Detail label="Signal" value={session.todaySignal || "Not recorded"} />
        <Detail label="Friction" value={session.blocker || "Not recorded"} />
        <Detail label="Tomorrow" value={session.tomorrowStart || "Not recorded"} />
        <Detail
          label="Previous start"
          value={formatPreviousStartResult(session.previousStartResult)}
        />
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}

function workActivities(session: MirrorSession): string {
  return [
    session.work.app ? "Personal" : null,
    session.work.game ? "Professional" : null,
    session.work.creative ? "Creative" : null,
    session.work.physical ? "Physical" : null,
    session.work.output ? session.work.customActivity?.trim() || "Other" : null,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" · ");
}

function formatTimeInvested(session: MirrorSession): string {
  const hours = session.work.hours ?? 0;
  const minutes = session.work.minutes ?? 0;
  if (hours <= 0 && minutes <= 0) return "Not recorded";
  return [hours > 0 ? `${hours} hr` : null, minutes > 0 ? `${minutes} min` : null]
    .filter(Boolean)
    .join(" ");
}

function formatPreviousStartResult(result?: PreviousStartResult): string {
  if (result === "yes") return "Yes";
  if (result === "partial") return "Partially";
  if (result === "no") return "No";
  return "Not recorded";
}
