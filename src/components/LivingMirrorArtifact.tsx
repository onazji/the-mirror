import { useState } from "react";
import { modalHaptic } from "../utils/haptics";
import type { ArtifactStats } from "../services/artifactEngine";
import { TIER_IMAGES, TIER_NAMES } from "../services/artifactEngine";
import styles from "./LivingMirrorArtifact.module.css";

type Props = {
  stats: ArtifactStats;
};

const ALL_TIERS = [0, 1, 2, 3, 4, 5] as const;

export function LivingMirrorArtifact({ stats }: Props) {
  const [open, setOpen] = useState(false);
  const [tierOverride, setTierOverride] = useState<number | null>(null);

  const activeTier = tierOverride ?? stats.tier;
  const activeTierImage = TIER_IMAGES[activeTier];
  const activeTierName = TIER_NAMES[activeTier];

  return (
    <>
      <button
        type="button"
        className={styles.artifactBtn}
        aria-label="Open Living Mirror"
        onClick={() => { modalHaptic(); setOpen(true); }}
      >
        <img
          src={activeTierImage}
          alt={`Living Mirror — ${activeTierName}`}
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
                alt={`Living Mirror — ${activeTierName}`}
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
                        title={TIER_NAMES[t]}
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
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    {activeTierName}
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
