export type GlassSensorStatus =
  | "unavailable" | "permission-required" | "denied" | "listening"
  | "active" | "stale" | "suspended" | "reduced-motion" | "stopped";

export type GlassOpticsController = {
  getStatus: () => GlassSensorStatus;
  /** Call only from an explicit user gesture on permission-gated platforms. */
  requestPermission: () => Promise<GlassSensorStatus>;
  dispose: () => void;
};

type OrientationConstructor = {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const VARIABLES = [
  "--mirror-tilt-x", "--mirror-tilt-y",
  "--mirror-specular-angle", "--mirror-specular-gain",
] as const;
const SAMPLE_EXPIRY_MS = 1500;
const FRAME_INTERVAL_MS = 1000 / 30;
const clamp = (value: number) => Math.max(-1, Math.min(1, value));
const delta = (value: number, origin: number) =>
  ((value - origin + 540) % 360) - 180;

/** Optional optical input only: no navigation state, geometry or React updates. */
export function attachGlassOptics(target: HTMLElement): GlassOpticsController {
  const constructor = (window as Window & {
    DeviceOrientationEvent?: OrientationConstructor;
  }).DeviceOrientationEvent;
  const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  let status: GlassSensorStatus = "unavailable";
  let disposed = false;
  let granted = !constructor?.requestPermission;
  let denied = false;
  let listening = false;
  let baseline: { beta: number; gamma: number; angle: number } | null = null;
  let lastSample = 0;
  let lastFrame = 0;
  let frame: number | null = null;
  let watchdog: number | null = null;
  let x = 0;
  let y = 0;
  let desiredX = 0;
  let desiredY = 0;

  const setStatus = (next: GlassSensorStatus) => {
    if (disposed || status === next) return;
    status = next;
    target.setAttribute("data-glass-sensor", next);
  };
  const write = () => {
    target.style.setProperty(VARIABLES[0], x.toFixed(4));
    target.style.setProperty(VARIABLES[1], y.toFixed(4));
    target.style.setProperty(VARIABLES[2], `${(x * 4 + y).toFixed(3)}deg`);
    target.style.setProperty(
      VARIABLES[3], (0.35 + Math.max(Math.abs(x), Math.abs(y)) * 0.65).toFixed(4),
    );
  };
  const neutral = () => {
    if (frame !== null) window.cancelAnimationFrame(frame);
    if (watchdog !== null) window.clearTimeout(watchdog);
    frame = watchdog = null;
    baseline = null;
    x = y = desiredX = desiredY = 0;
    lastFrame = 0;
    write();
  };
  const tick = (now: number) => {
    frame = null;
    if (disposed || !listening) return;
    const elapsed = now - lastFrame;
    if (lastFrame && elapsed < FRAME_INTERVAL_MS) {
      frame = window.requestAnimationFrame(tick);
      return;
    }
    const blend = 1 - Math.exp(-Math.min(elapsed || FRAME_INTERVAL_MS, 80) / 140);
    x += (desiredX - x) * blend;
    y += (desiredY - y) * blend;
    lastFrame = now;
    const settled = Math.abs(desiredX - x) < 0.003 && Math.abs(desiredY - y) < 0.003;
    if (settled) { x = desiredX; y = desiredY; }
    write();
    if (!settled) frame = window.requestAnimationFrame(tick);
  };
  const expire = () => {
    watchdog = null;
    if (disposed || !listening) return;
    const remaining = SAMPLE_EXPIRY_MS - (performance.now() - lastSample);
    if (remaining > 0) {
      watchdog = window.setTimeout(expire, remaining);
    } else {
      neutral();
      setStatus("stale");
    }
  };
  const orientation = (event: DeviceOrientationEvent) => {
    const { beta, gamma } = event;
    if (!listening || beta === null || gamma === null ||
        !Number.isFinite(beta) || !Number.isFinite(gamma) ||
        Math.abs(beta) > 180 || Math.abs(gamma) > 90) return;
    const rawAngle = window.screen.orientation?.angle ?? 0;
    const angle = Number.isFinite(rawAngle) ? rawAngle : 0;
    if (!baseline || baseline.angle !== angle) baseline = { beta, gamma, angle };
    const horizontal = clamp(delta(gamma, baseline.gamma) / 18);
    const vertical = clamp(delta(beta, baseline.beta) / 24);
    const radians = angle * Math.PI / 180;
    desiredX = clamp(horizontal * Math.cos(radians) - vertical * Math.sin(radians));
    desiredY = clamp(horizontal * Math.sin(radians) + vertical * Math.cos(radians));
    lastSample = performance.now();
    setStatus("active");
    if (watchdog === null) watchdog = window.setTimeout(expire, SAMPLE_EXPIRY_MS);
    if (frame === null && (Math.abs(desiredX - x) > 0.003 || Math.abs(desiredY - y) > 0.003)) {
      frame = window.requestAnimationFrame(tick);
    }
  };
  const reconcile = () => {
    if (disposed) return;
    if (listening) window.removeEventListener("deviceorientation", orientation);
    listening = false;
    neutral();
    if (!constructor) setStatus("unavailable");
    else if (media?.matches) setStatus("reduced-motion");
    else if (document.visibilityState === "hidden") setStatus("suspended");
    else if (denied) setStatus("denied");
    else if (!granted) setStatus("permission-required");
    else {
      window.addEventListener("deviceorientation", orientation, { passive: true });
      listening = true;
      setStatus("listening");
    }
  };

  // No prompt, no sensor loop without valid data; stale/invalid input is neutral.
  write();
  target.setAttribute("data-glass-sensor", status);
  media?.addEventListener?.("change", reconcile);
  document.addEventListener("visibilitychange", reconcile);
  reconcile();

  return {
    getStatus: () => status,
    requestPermission: async () => {
      if (disposed) return "stopped";
      if (!constructor || media?.matches || document.visibilityState === "hidden") {
        reconcile();
        return status;
      }
      if (constructor.requestPermission) {
        try {
          const result = await constructor.requestPermission();
          granted = result === "granted";
          denied = !granted;
        } catch {
          granted = false;
          denied = true;
        }
      }
      if (disposed) return "stopped";
      reconcile();
      return status;
    },
    dispose: () => {
      if (disposed) return;
      if (listening) window.removeEventListener("deviceorientation", orientation);
      media?.removeEventListener?.("change", reconcile);
      document.removeEventListener("visibilitychange", reconcile);
      neutral();
      disposed = true;
      listening = false;
      status = "stopped";
      VARIABLES.forEach((property) => target.style.removeProperty(property));
      target.removeAttribute("data-glass-sensor");
    },
  };
}