import { useEffect, useRef } from "react";
import { getMirrorCard } from "../services/cardEngine";
import type { EchoRecord } from "../types/echo";
import type { MirrorSession } from "../types/mirror";
import styles from "./EchoComparison.module.css";

type Props = {
  echo: EchoRecord;
  sessions: MirrorSession[];
  onClose: () => void;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function EchoComparison({ echo, sessions, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const earlier = sessions.find((session) => session.id === echo.earlierSessionId);
  const later = sessions.find((session) => session.id === echo.laterSessionId);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  if (!earlier || !later) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <article
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="echo-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <div className={styles.kicker}>Echo</div>
            <h1 id="echo-title" className={styles.title}>Two familiar moments</h1>
          </div>
          <button ref={closeRef} type="button" className={styles.close} onClick={onClose} aria-label="Close Echo">×</button>
        </header>

        <p className={styles.proof}>
          Both reflections recorded <strong>{echo.matchedActivity.label}</strong> with {echo.energy} energy and {echo.pace} momentum.
        </p>

        <div className={styles.pair}>
          <Moment label="Earlier" session={earlier} />
          <Moment label="Later" session={later} />
        </div>

        <div className={styles.question}>What do you notice?</div>
        <p className={styles.disclaimer}>The resemblance is factual. What it means remains yours to interpret.</p>
      </article>
    </div>
  );
}

function Moment({ label, session }: { label: string; session: MirrorSession }) {
  const card = getMirrorCard(session.energy, session.pace);
  const invested = formatTime(session);
  return (
    <section className={styles.moment}>
      <div className={styles.momentLabel}>{label}</div>
      <time className={styles.date} dateTime={new Date(session.timestamp).toISOString()}>
        {dateFormatter.format(session.timestamp)}
      </time>
      <h2 className={styles.card}>{card.title}</h2>
      <div className={styles.state}>{session.energy} energy · {session.pace} momentum</div>
      <Fact label="Time invested" value={invested} />
      <Fact label="Signal" value={session.todaySignal || "Not recorded"} />
      <Fact label="Friction" value={session.blocker || "Not recorded"} />
      <Fact label="Tomorrow" value={session.tomorrowStart || "Not recorded"} />
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.fact}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatTime(session: MirrorSession): string {
  const hours = session.work.hours ?? 0;
  const minutes = session.work.minutes ?? 0;
  if (hours <= 0 && minutes <= 0) {
    return `${session.work.sessions} session${session.work.sessions === 1 ? "" : "s"}`;
  }
  return [hours > 0 ? `${hours} hr` : null, minutes > 0 ? `${minutes} min` : null]
    .filter(Boolean)
    .join(" ");
}
