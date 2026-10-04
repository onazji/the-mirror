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

function carrierPath(
  fiber: (typeof SELENITE_FIBERS)[number],
  width: number,
  height: number,
) {
  const row = height / 88;
  const center = fiber.y * height;
  const amplitude = row * fiber.bend;
  const bundle = row * fiber.bundle;
  const point = (step: number, strand: number) => {
    const x = (width * step) / 4 + strand * (width * 0.012 + (fiber.id % 5) * 0.6);
    const wave =
      Math.sin(fiber.phase + step * 1.43 + strand * 0.87) * amplitude +
      Math.sin(fiber.phase * 0.61 + step * 2.19 + strand) * amplitude * 0.32;
    return `${x.toFixed(1)} ${(center + strand * bundle + wave).toFixed(2)}`;
  };

  // Three close, gently wandering fibers share the V2 population clock. Their
  // slight curvature lets neighboring bundles mingle instead of meeting as
  // perfectly aligned bar endpoints.
  return [-1, 0, 1]
    .map((strand) => {
      const samples = Array.from({ length: 5 }, (_, step) =>
        point(step, strand).split(" ").map(Number)
      );
      const segments = samples.slice(0, -1).map(([x0, y0], step) => {
        const [x3, y3] = samples[step + 1];
        const distance = x3 - x0;
        const delta = y3 - y0;
        const x1 = x0 + distance / 3;
        const x2 = x0 + (distance * 2) / 3;
        return `C ${x1.toFixed(1)} ${(y0 + delta / 3).toFixed(2)} ${x2.toFixed(1)} ${(y0 + (delta * 2) / 3).toFixed(2)} ${x3.toFixed(1)} ${y3.toFixed(2)}`;
      });
      return `M ${samples[0][0].toFixed(1)} ${samples[0][1].toFixed(2)} ${segments.join(" ")}`;
    })
    .join(" ");
}

function striationPath(index: number, width: number, height: number) {
  const y = ((index + 0.5) / 44) * height;
  const amplitude = height * (0.0012 + (index % 4) * 0.00025);
  const phase = index * 1.91;
  const p1 = y + Math.sin(phase) * amplitude;
  const p2 = y + Math.sin(phase + 1.8) * amplitude;
  const p3 = y + Math.sin(phase + 3.5) * amplitude;
  // Multiple sub-pixel internal fibers, not one opaque bar. These static
  // profiles are reused for both neutral structure and environmental scattering.
  return [-1, 0, 1].map((strand) => {
    const offset = strand * height / 132;
    return `M -4 ${(y + offset).toFixed(2)} C ${(width * 0.2).toFixed(1)} ${(p1 + offset).toFixed(2)}, ${(width * 0.34).toFixed(1)} ${(p2 + offset).toFixed(2)}, ${(width * 0.5).toFixed(1)} ${(p3 + offset).toFixed(2)} S ${(width * 0.82).toFixed(1)} ${(p1 + offset).toFixed(2)}, ${(width + 4).toFixed(1)} ${(y + offset).toFixed(2)}`;
  }).join(" ");
}

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
  const silkPatternId = `${id}-silk-pattern`;
  const silkMaskId = `${id}-silk-mask`;

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
          "--refraction-filter": `url(#${diffusionId})`,
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
                d={carrierPath(fiber, width, height)}
                // Each of the three full-width subpaths keeps the original
                // normalized 1000-unit spatial population progression.
                pathLength="3000"
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
            {Array.from({ length: 44 }, (_, index) => (
              <use
                key={index}
                href={`#${id}-striation-${index}`}
                fill="none"
                stroke={index % 5 === 0 ? "#ffffff" : "#c4c9ca"}
                strokeWidth={index % 7 === 0 ? "0.8" : "0.55"}
                opacity={0.1 + (index % 4) * 0.025}
              />
            ))}
          </pattern>
          {Array.from({ length: 44 }, (_, index) => (
            <path
              key={index}
              id={`${id}-striation-${index}`}
              d={striationPath(index, width, height / 3)}
              fill="none"
            />
          ))}
          <pattern
            id={silkPatternId}
            patternUnits="userSpaceOnUse"
            width={width}
            height={height / 3}
          >
            {Array.from({ length: 44 }, (_, index) => (
              <use
                key={index}
                href={`#${id}-striation-${index}`}
                className={styles.silkFiber}
                stroke="white"
              />
            ))}
          </pattern>
          <mask id={silkMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
            <rect width={width} height={height} fill={`url(#${silkPatternId})`} />
          </mask>
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
          />
          {/* Directional environmental light occupies fine fiber channels.
              Their cross-section peaks before maximum population; neither
              the complete surface nor a texture is pulsed brighter. */}
          <use
            href={`#${environmentId}`}
            className={styles.silkLight}
            mask={`url(#${silkMaskId})`}
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