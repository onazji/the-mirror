import { modalHaptic } from "../utils/haptics";
import styles from "./ExploreButton.module.css";

type Props = {
  onClick: () => void;
};

export function ExploreButton({ onClick }: Props) {
  return (
    <button
      type="button"
      className={styles.button}
      aria-label="Explore"
      title="Explore"
      onClick={() => {
        modalHaptic();
        onClick();
      }}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 40 40"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="explore-mirror-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6d87b8" />
            <stop offset="0.5" stopColor="#b8892a" />
            <stop offset="1" stopColor="#8c6eb0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((frame) => (
          <g key={frame} className={`${styles.frame} ${styles[`frame${frame + 1}`]}`}>
            <rect
              x="7"
              y="7"
              width="26"
              height="26"
              rx="8"
              fill="none"
              stroke="url(#explore-mirror-line)"
              strokeWidth="1.35"
            />
          </g>
        ))}
        <circle cx="20" cy="20" r="1.5" className={styles.vanishingPoint} />
      </svg>
    </button>
  );
}
