import { getMirrorCard } from "../services/cardEngine";
import type { EchoAccessLevel, EchoRecord } from "../types/echo";
import type { MirrorSession } from "../types/mirror";
import styles from "./EchoCollection.module.css";

type Props = {
  echoes: EchoRecord[];
  sessions: MirrorSession[];
  accessLevel: EchoAccessLevel;
  onOpenEcho: (echo: EchoRecord) => void;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function EchoCollection({ echoes, sessions, accessLevel, onOpenEcho }: Props) {
  const byId = new Map(sessions.map((session) => [session.id, session]));
  const validEchoes = echoes.filter(
    (echo) => byId.has(echo.earlierSessionId) && byId.has(echo.laterSessionId)
  );
  const visibleEchoes =
    accessLevel === "premium"
      ? validEchoes
      : validEchoes.filter((echo) => echo.introductory).slice(0, 1);
  const hiddenCount = validEchoes.length - visibleEchoes.length;

  return (
    <div>
      <div className={styles.heading}>Echoes</div>
      <p className={styles.copy}>
        Two reflections can surface together when their recorded details genuinely align.
      </p>

      {visibleEchoes.length === 0 ? (
        <div className={styles.empty}>
          No Echo has surfaced yet. Mirror waits for a meaningful match rather than inventing one.
          {accessLevel === "free" ? (
            <span className={styles.freeLine}>
              Your first qualifying Echo is included. Later discoveries and the complete collection are part of Mirror Premium.
            </span>
          ) : null}
        </div>
      ) : (
        <div className={styles.list} aria-label="Echo collection">
          {visibleEchoes.map((echo) => {
            const earlier = byId.get(echo.earlierSessionId)!;
            const later = byId.get(echo.laterSessionId)!;
            const earlierCard = getMirrorCard(earlier.energy, earlier.pace);
            const laterCard = getMirrorCard(later.energy, later.pace);
            return (
              <button
                key={echo.id}
                type="button"
                className={styles.item}
                onClick={() => onOpenEcho(echo)}
              >
                <span className={styles.activity}>{echo.matchedActivity.label}</span>
                <span className={styles.cards}>{earlierCard.title} ↔ {laterCard.title}</span>
                <span className={styles.dates}>
                  {dateFormatter.format(earlier.timestamp)} · {dateFormatter.format(later.timestamp)}
                </span>
                <span className={styles.open}>View Echo →</span>
              </button>
            );
          })}
        </div>
      )}

      {hiddenCount > 0 ? (
        <div className={styles.accessNote}>
          {hiddenCount} additional Echo{hiddenCount === 1 ? "" : "es"} remain safely stored on this device. Mirror Premium opens the complete collection.
        </div>
      ) : null}
      {accessLevel === "free" && visibleEchoes.length > 0 && hiddenCount === 0 ? (
        <div className={styles.accessNote}>
          This introductory Echo remains available here. Future discoveries and the complete collection are part of Mirror Premium.
        </div>
      ) : null}
    </div>
  );
}
