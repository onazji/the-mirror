import { useMemo, useState } from "react";
import {
  buildReflectionActivity,
  buildStateDistribution,
  type ReflectionActivityPoint,
} from "../services/contextService";
import type { MirrorSession } from "../types/mirror";
import styles from "./ContextDashboard.module.css";

type ActivityMode = "daily" | "cumulative";

export function ContextDashboard({ sessions }: { sessions: MirrorSession[] }) {
  const [activityMode, setActivityMode] = useState<ActivityMode>("daily");
  const distribution = useMemo(() => buildStateDistribution(sessions), [sessions]);
  const activity = useMemo(() => buildReflectionActivity(sessions), [sessions]);

  return (
    <div className={styles.dashboard}>
      <section aria-labelledby="state-distribution-title">
        <h2 id="state-distribution-title" className={styles.heading}>State distribution</h2>
        <p className={styles.copy}>
          Every recorded state, ranked by how often it appeared. No state is treated as better or worse.
        </p>

        <div className={styles.stateList}>
          {distribution.map((entry) => (
            <div
              key={entry.id}
              className={`${styles.stateRow} ${entry.highlighted ? styles.stateRowHighlighted : ""}`}
            >
              <div className={styles.rank} aria-label={`Rank ${entry.rank}`}>{entry.rank}</div>
              <div className={styles.stateBody}>
                <div className={styles.stateHeader}>
                  <span className={styles.stateName}>{entry.title}</span>
                  <span className={styles.stateValue}>
                    {entry.count} · {formatPercentage(entry.percentage)}
                  </span>
                </div>
                <div className={styles.barTrack} aria-hidden="true">
                  <div
                    className={styles.barFill}
                    style={{ width: `${entry.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.activitySection} aria-labelledby="activity-title">
        <h2 id="activity-title" className={styles.heading}>Reflection activity</h2>
        <p className={styles.copy}>
          Activity begins with your earliest saved reflection and includes days with none.
        </p>

        <div className={styles.viewSwitch} role="group" aria-label="Reflection activity view">
          <button
            type="button"
            className={`${styles.switchButton} ${activityMode === "daily" ? styles.switchButtonActive : ""}`}
            aria-pressed={activityMode === "daily"}
            onClick={() => setActivityMode("daily")}
          >
            Daily
          </button>
          <button
            type="button"
            className={`${styles.switchButton} ${activityMode === "cumulative" ? styles.switchButtonActive : ""}`}
            aria-pressed={activityMode === "cumulative"}
            onClick={() => setActivityMode("cumulative")}
          >
            Cumulative
          </button>
        </div>

        {activity.length === 0 ? (
          <div className={styles.empty}>Activity will appear after your first reflection.</div>
        ) : (
          <ActivityChart points={activity} mode={activityMode} />
        )}
      </section>
    </div>
  );
}

function ActivityChart({
  points,
  mode,
}: {
  points: ReflectionActivityPoint[];
  mode: ActivityMode;
}) {
  const width = Math.max(320, points.length * 18);
  const height = 188;
  const top = 20;
  const bottom = 32;
  const plotHeight = height - top - bottom;
  const values = points.map((point) =>
    mode === "daily" ? point.count : point.cumulative
  );
  const maxValue = Math.max(1, ...values);
  const step = points.length <= 1 ? width : width / points.length;
  const xFor = (index: number) => step * index + step / 2;
  const yFor = (value: number) => top + plotHeight - (value / maxValue) * plotHeight;
  const linePoints = values
    .map((value, index) => `${xFor(index)},${yFor(value)}`)
    .join(" ");
  const chartLabel =
    mode === "daily"
      ? `Daily reflections from ${points[0].dateLabel} to ${points.at(-1)?.dateLabel}. Maximum ${maxValue} in one day.`
      : `Cumulative reflections from ${points[0].dateLabel} to ${points.at(-1)?.dateLabel}. Total ${points.at(-1)?.cumulative ?? 0}.`;

  return (
    <div>
      <div className={styles.chartSummary}>
        <span>{points[0].dateLabel}</span>
        <strong>{mode === "daily" ? `Daily high: ${maxValue}` : `Total: ${points.at(-1)?.cumulative ?? 0}`}</strong>
        <span>{points.at(-1)?.dateLabel}</span>
      </div>
      <div className={styles.chartScroller}>
        <svg
          className={styles.chart}
          style={{ width }}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={chartLabel}
        >
          <line x1="0" y1={top + plotHeight} x2={width} y2={top + plotHeight} className={styles.axis} />
          <line x1="0" y1={top} x2={width} y2={top} className={styles.guide} />
          {mode === "daily" ? (
            points.map((point, index) => {
              const barWidth = Math.max(3, Math.min(11, step * 0.58));
              const y = yFor(point.count);
              return (
                <rect
                  key={point.dateKey}
                  x={xFor(index) - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={Math.max(1, top + plotHeight - y)}
                  rx="2"
                  className={point.count === 0 ? styles.zeroBar : styles.bar}
                >
                  <title>{`${point.dateLabel}: ${point.count} reflection${point.count === 1 ? "" : "s"}`}</title>
                </rect>
              );
            })
          ) : (
            <>
              <polyline points={linePoints} className={styles.cumulativeLine} />
              {points.map((point, index) => (
                <circle
                  key={point.dateKey}
                  cx={xFor(index)}
                  cy={yFor(point.cumulative)}
                  r={points.length <= 60 ? 2.3 : 1.2}
                  className={styles.point}
                >
                  <title>{`${point.dateLabel}: ${point.cumulative} total reflections`}</title>
                </circle>
              ))}
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

function formatPercentage(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
}
