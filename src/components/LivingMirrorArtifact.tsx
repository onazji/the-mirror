import { useState } from "react";
import type { ArtifactStats } from "../services/artifactEngine";
import styles from "./LivingMirrorArtifact.module.css";

type Props = {
  stats: ArtifactStats;
};

export function LivingMirrorArtifact({ stats }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.artifactBtn}
        aria-label="Open Living Mirror"
        onClick={() => setOpen(true)}
      >
        <img
          src={stats.tierImage}
          alt={`Mirror tier ${stats.tier}`}
          className={styles.artifactImg}
        />
      </button>

      {open ? (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="Close Living Mirror"
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            <div className={styles.modalBody}>
              <img
                src={stats.tierImage}
                alt={`Mirror tier ${stats.tier}`}
                className={styles.tierImage}
              />

              <div className={styles.modalText}>
                <h2 className={styles.modalTitle}>Living Mirror</h2>
                <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--muted)", textAlign: "center" }}>
                  The mirror has witnessed:
                </p>
                <ul className={styles.witnessList}>
                  <li>{stats.totalReflections} reflection{stats.totalReflections !== 1 ? "s" : ""}</li>
                  <li>{stats.daysSinceFirst} day{stats.daysSinceFirst !== 1 ? "s" : ""} since first return</li>
                  <li>Most reflected state: {stats.mostReflectedState ?? "—"}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
