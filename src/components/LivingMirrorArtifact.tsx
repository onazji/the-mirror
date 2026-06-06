import { useState } from "react";
import type { ArtifactStats } from "../services/artifactEngine";
import { TIER_IMAGES } from "../services/artifactEngine";
import styles from "./LivingMirrorArtifact.module.css";

type Props = {
  stats: ArtifactStats;
};

const ALL_TIERS = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

export function LivingMirrorArtifact({ stats }: Props) {
  const [open, setOpen] = useState(false);
  const [tierOverride, setTierOverride] = useState<number | null>(null);

  const activeTierImage =
    tierOverride !== null ? TIER_IMAGES[tierOverride] : stats.tierImage;

  return (
    <>
      <button
        type="button"
        className={styles.artifactBtn}
        aria-label="Open Living Mirror"
        onClick={() => setOpen(true)}
      >
        <img
          src={activeTierImage}
          alt={`Mirror tier ${tierOverride ?? stats.tier}`}
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
                src={activeTierImage}
                alt={`Mirror tier ${tierOverride ?? stats.tier}`}
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

              {import.meta.env.DEV ? (
                <div className={styles.devPanel}>
                  <div className={styles.devLabel}>Artifact Tier Test</div>
                  <div className={styles.devBtns}>
                    {ALL_TIERS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`${styles.devTierBtn} ${tierOverride === t ? styles.devTierBtnActive : ""}`}
                        onClick={() => setTierOverride(t)}
                      >
                        {t}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={styles.devResetBtn}
                      onClick={() => setTierOverride(null)}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
