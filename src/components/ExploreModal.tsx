import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { HistoryAccessLevel } from "../services/historyService";
import type { MirrorSession } from "../types/mirror";
import { HistoryArchive } from "./HistoryArchive";
import styles from "./ExploreModal.module.css";

type ExploreTab = "history" | "context" | "echoes";

type Props = {
  sessions: MirrorSession[];
  onClose: () => void;
  historyAccess?: HistoryAccessLevel;
};

const TABS: readonly { id: ExploreTab; label: string }[] = [
  { id: "history", label: "History" },
  { id: "context", label: "Context" },
  { id: "echoes", label: "Echoes" },
];

export function ExploreModal({ sessions, onClose, historyAccess = "free" }: Props) {
  const [activeTab, setActiveTab] = useState<ExploreTab>("history");
  const closeRef = useRef<HTMLButtonElement>(null);
  const tabRefs = useRef<Record<ExploreTab, HTMLButtonElement | null>>({
    history: null,
    context: null,
    echoes: null,
  });

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
            <HistoryArchive sessions={sessions} accessLevel={historyAccess} />
          ) : null}
          {activeTab === "context" ? <ContextPreview reflectionCount={sessions.length} /> : null}
          {activeTab === "echoes" ? <EchoesPreview /> : null}
        </section>

        <div className={styles.privacy}>Your reflections remain on this device.</div>
      </div>
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
