import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import styles from "./ReflectiveTransition.module.css";
import {
  SELENITE_DURATION_MS,
  SELENITE_SWAP_MS,
  SELENITE_FIBERS,
} from "./seleniteMaterial";

export const REFLECTIVE_TRANSITION_DURATION_MS = SELENITE_DURATION_MS;

type Props = {
  direction: "down" | "up";
  onSwap: () => void;
  onComplete: () => void;
};

export function ReflectiveTransition({
  onSwap,
  onComplete,
}: Props) {
  // Both navigation directions intentionally share the same material physics.
  const id = useId().replace(/:/g, "");
  const materialRef = useRef<SVGSVGElement>(null);
  const [viewport, setViewport] = useState(() => ({
    width: document.documentElement.clientWidth,
    height: window.innerHeight,
  }));
  const { width, height } = viewport;
  const populationId = `${id}-population`;
  const environmentId = `${id}-environment`;
  const structureId = `${id}-structure`;
  const diffusionId = `${id}-diffusion`;

  useEffect(() => {
    const resize = () => setViewport({
      width: document.documentElement.clientWidth,
      height: window.innerHeight,
    });
    const observer = new ResizeObserver(resize);
    observer.observe(document.documentElement);
    window.addEventListener("resize", resize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      onSwap();
      const completeTimer = window.setTimeout(onComplete, 0);

      return () => {
        window.clearTimeout(completeTimer);
      };
    }

    let swapTimer: number | undefined;
    let completeTimer: number | undefined;
    // SVG mask setup can defer the first visual frame in WebView. Measure its
    // clock once, then retain independent timers (never animationend-driven).
    const frame = window.requestAnimationFrame(() => {
      const animation = materialRef.current?.querySelector("path")
        ?.getAnimations?.()[0];
      const elapsed = typeof animation?.currentTime === "number"
        ? animation.currentTime
        : 0;
      swapTimer = window.setTimeout(onSwap, Math.max(0, SELENITE_SWAP_MS - elapsed));
      completeTimer = window.setTimeout(
        onComplete,
        Math.max(0, REFLECTIVE_TRANSITION_DURATION_MS - elapsed),
      );
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(swapTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete, onSwap]);

  return (
    <div
      className={styles.overlay}
      style={
        {
          "--selenite-duration": `${REFLECTIVE_TRANSITION_DURATION_MS}ms`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <svg
        ref={materialRef}
        className={styles.material}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        focusable="false"
      >
        <defs>
          <mask
            id={populationId}
            maskUnits="userSpaceOnUse"
            x="0" y="0" width={width} height={height}
          >
            <rect width={width} height={height} fill="black" />
            {SELENITE_FIBERS.map((fiber) => (
              <path
                key={fiber.id}
                className={styles.fiber}
                d={`M 0 ${fiber.y * height} H ${width}`}
                pathLength="1000"
                style={{
                  "--seed": fiber.offset,
                  "--growth": fiber.growth,
                  "--band": `${height / 88 * 1.4}px`,
                } as CSSProperties}
              />
            ))}
          </mask>
          {/* Reuse the actual environment asset, with the same centered cover
              crop as body::before. The original background never moves. */}
          <image
            id={environmentId}
            href="/THE-MIRROR-BG.png"
            width={width} height={height}
            preserveAspectRatio="xMidYMid slice"
          />
          <filter id={diffusionId} x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation={`${width * 0.009} ${height * 0.0015}`} />
          </filter>
          <pattern
            id={structureId}
            patternUnits="userSpaceOnUse"
            width={width}
            height={height / 3}
          >
            <image
              href="/selenite-fibers.webp"
              width={width}
              height={height / 3}
              preserveAspectRatio="none"
            />
          </pattern>
        </defs>
        <g mask={`url(#${populationId})`}>
          <use
            href={`#${environmentId}`}
            className={styles.scattering}
            filter={`url(#${diffusionId})`}
          />
          <use
            href={`#${environmentId}`}
            className={styles.refraction}
            transform="translate(3 0)"
            filter={`url(#${diffusionId})`}
          />
          <rect
            className={styles.mineralDepth}
            width={width} height={height} fill="#555b61"
          />
          <rect width={width} height={height} fill={`url(#${structureId})`} />
        </g>
      </svg>
    </div>
  );
}