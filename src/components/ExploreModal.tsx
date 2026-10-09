import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { getMirrorCard } from "../services/cardEngine";
import { FREE_HISTORY_LIMIT, getRecentSessions } from "../services/historyService";
import type { MirrorSession } from "../types/mirror";
import styles from "./ExploreModal.module.css";

type ExploreTab = "history" | "context" | "echoes";

type Props = {
  sessions: MirrorSession[];
  onClose: () => void;
};

const TABS: readonly { id: ExploreTab; label: string }[] = [
  { id: "history", label: "History" },
  { id: "context", label: "Context" },
  { id: "echoes", label: "Echoes" },
];

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function ExploreModal({ sessions, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<ExploreTab>("history");
  const closeRef = useRef<HTMLButtonElement>(null);
  const tabRefs = useRef<Record<ExploreTab, HTMLButtonElement | null>>({
    history: null,
    context: null,
    echoes: null,
  });
  const recentSessions = useMemo(
    () => getRecentSessions(sessions, FREE_HISTORY_LIMIT),
    [sessions]
  );

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      previousFocus?.focus();
    };
  }, [onClose]);

  const selectByKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = TABS.findIndex((tab) => tab.id === activeTab);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % TABS.length;
    else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    } else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = TABS.length - 1;
    else return;

    event.preventDefault();
    const nextTab = TABS[nextIndex].id;
    setActiveTab(nextTab);
    tabRefs.current[nextTab]?.focus();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="explore-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <div className={styles.kicker}>The Mirror</div>
            <h1 id="explore-title" className={styles.title}>Explore</h1>
            <p className={styles.lead}>Look further into what you have recorded.</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className={styles.close}
            aria-label="Close Explore"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className={styles.tabs} role="tablist" aria-label="Explore sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[tab.id] = element;
              }}
              id={`explore-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`explore-panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={selectByKeyboard}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section
          id={`explore-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`explore-tab-${activeTab}`}
          tabIndex={0}
          className={styles.content}
        >
          {activeTab === "history" ? (
            <HistoryPreview sessions={recentSessions} totalCount={sessions.length} />
          ) : null}
          {activeTab === "context" ? <ContextPreview reflectionCount={sessions.length} /> : null}
          {activeTab === "echoes" ? <EchoesPreview /> : null}
        </section>

        <div className={styles.privacy}>Your reflections remain on this device.</div>
      </div>
    </div>
  );
}

function HistoryPreview({
  sessions,
  totalCount,
}: {
  sessions: MirrorSession[];
  totalCount: number;
}) {
  return (
    <div>
      <div className={styles.sectionHeading}>Recent reflections</div>
      <p className={styles.sectionCopy}>
        Revisit the five most recent moments in your complete local history.
      </p>
      {sessions.length === 0 ? (
        <div className={styles.empty}>Your reflections will appear here after your first return.</div>
      ) : (
        <div className={styles.historyList}>
          {sessions.map((session) => {
            const card = getMirrorCard(session.energy, session.pace);
            return (
              <article key={session.id} className={styles.historyItem}>
                <time dateTime={new Date(session.timestamp).toISOString()} className={styles.date}>
                  {dateFormatter.format(session.timestamp)}
                </time>
                <div className={styles.cardTitle}>{card.title}</div>
                <div className={styles.meta}>
                  {session.energy} energy · {session.pace} momentum
                </div>
              </article>
            );
          })}
        </div>
      )}
      {totalCount > FREE_HISTORY_LIMIT ? (
        <div className={styles.previewNote}>
          {totalCount - FREE_HISTORY_LIMIT} earlier reflection
          {totalCount - FREE_HISTORY_LIMIT === 1 ? "" : "s"} remain safely stored. Complete archive browsing is part of Mirror Premium.
        </div>
      ) : null}
    </div>
  );
}

function ContextPreview({ reflectionCount }: { reflectionCount: number }) {
  return (
    <div className={styles.centeredPreview}>
      <div className={styles.depthMark} aria-hidden="true">◎</div>
      <div className={styles.sectionHeading}>See what you recorded over time</div>
      <p className={styles.sectionCopy}>
        Context will organize your states and reflection activity without judging what they mean.
      </p>
      <div className={styles.factualCount}>
        {reflectionCount} reflection{reflectionCount === 1 ? "" : "s"} available locally
      </div>
    </div>
  );
}

function EchoesPreview() {
  return (
    <div className={styles.centeredPreview}>
      <div className={styles.depthMark} aria-hidden="true">◌</div>
      <div className={styles.sectionHeading}>Connections, when they surface</div>
      <p className={styles.sectionCopy}>
        Echoes will place two qualifying reflections together. The resemblance is factual; what it means remains yours to notice.
      </p>
      <div className={styles.empty}>No Echo has surfaced yet.</div>
    </div>
  );
}
