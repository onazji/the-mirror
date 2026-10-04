import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attachGlassOptics, type GlassOpticsController } from "../src/services/glassOpticsService";

describe("optional glass optical input", () => {
  let target: HTMLDivElement;
  let controller: GlassOpticsController | undefined;
  let reduced = false;
  let visibility = "visible";
  let mediaListeners: Set<() => void>;
  const sample = (beta: number | null, gamma: number | null) => {
    const event = new Event("deviceorientation");
    Object.assign(event, { beta, gamma });
    window.dispatchEvent(event);
  };
  const start = () => controller = attachGlassOptics(target);

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date", "performance"] });
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(performance.now()), 16));
    vi.stubGlobal("cancelAnimationFrame", (handle: number) => window.clearTimeout(handle));
    vi.stubGlobal("DeviceOrientationEvent", class {});
    reduced = false;
    visibility = "visible";
    mediaListeners = new Set();
    vi.stubGlobal("matchMedia", () => ({
      get matches() { return reduced; },
      addEventListener: (_type: string, callback: () => void) => mediaListeners.add(callback),
      removeEventListener: (_type: string, callback: () => void) => mediaListeners.delete(callback),
    }));
    vi.spyOn(document, "visibilityState", "get").mockImplementation(() => visibility as DocumentVisibilityState);
    target = document.createElement("div");
    document.body.append(target);
  });
  afterEach(() => {
    controller?.dispose();
    controller = undefined;
    target.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("is neutral and fully optional without a supported sensor", () => {
    vi.stubGlobal("DeviceOrientationEvent", undefined);
    expect(start().getStatus()).toBe("unavailable");
    expect(target.style.getPropertyValue("--mirror-tilt-x")).toBe("0.0000");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("never prompts automatically; explicit denial and errors remain safe", async () => {
    const requestPermission = vi.fn().mockResolvedValue("denied");
    vi.stubGlobal("DeviceOrientationEvent", { requestPermission });
    expect(start().getStatus()).toBe("permission-required");
    expect(requestPermission).not.toHaveBeenCalled();
    expect(await controller!.requestPermission()).toBe("denied");
    sample(60, 10);
    vi.advanceTimersByTime(100);
    expect(target.style.getPropertyValue("--mirror-tilt-x")).toBe("0.0000");
    requestPermission.mockRejectedValueOnce(new Error("not authorized"));
    expect(await controller!.requestPermission()).toBe("denied");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("starts a gated sensor only after explicit permission is granted", async () => {
    const requestPermission = vi.fn().mockResolvedValue("granted");
    vi.stubGlobal("DeviceOrientationEvent", { requestPermission });
    start();
    sample(60, 0);
    expect(controller!.getStatus()).toBe("permission-required");
    expect(await controller!.requestPermission()).toBe("listening");
    sample(60, 0);
    sample(68, 10);
    vi.advanceTimersByTime(600);
    expect(controller!.getStatus()).toBe("active");
    expect(Number(target.style.getPropertyValue("--mirror-tilt-x"))).toBeGreaterThan(0.4);
  });

  it("bounds and smooths optical updates to at most 30 per second without a perpetual frame loop", () => {
    start();
    sample(60, 0);
    const writes = vi.spyOn(target.style, "setProperty");
    for (let index = 0; index < 100; index++) sample(78, 30);
    expect(writes).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    const x = Number(target.style.getPropertyValue("--mirror-tilt-x"));
    expect(x).toBeGreaterThan(0.9);
    expect(x).toBeLessThanOrEqual(1);
    expect(writes.mock.calls.filter(([key]) => key === "--mirror-tilt-x").length).toBeLessThanOrEqual(30);
    // Settled motion leaves only one stale-input watchdog, no RAF loop.
    expect(vi.getTimerCount()).toBe(1);
  });

  it("ignores malformed samples and returns neutral when valid data becomes stale", () => {
    start();
    sample(null, 0);
    sample(NaN, 10);
    sample(999, 999);
    expect(controller!.getStatus()).toBe("listening");
    expect(vi.getTimerCount()).toBe(0);
    sample(60, 0);
    sample(68, 10);
    vi.advanceTimersByTime(500);
    expect(Number(target.style.getPropertyValue("--mirror-tilt-x"))).toBeGreaterThan(0);
    vi.advanceTimersByTime(1000);
    expect(controller!.getStatus()).toBe("stale");
    expect(target.style.getPropertyValue("--mirror-tilt-x")).toBe("0.0000");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("suspends on background/reduced motion, resumes with a new baseline, and cleans up", () => {
    start();
    sample(60, 0);
    sample(68, 10);
    visibility = "hidden";
    document.dispatchEvent(new Event("visibilitychange"));
    expect(controller!.getStatus()).toBe("suspended");
    expect(vi.getTimerCount()).toBe(0);
    sample(68, 10);
    expect(controller!.getStatus()).toBe("suspended");
    visibility = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
    sample(100, 25);
    expect(target.style.getPropertyValue("--mirror-tilt-x")).toBe("0.0000");
    reduced = true;
    mediaListeners.forEach((callback) => callback());
    expect(controller!.getStatus()).toBe("reduced-motion");
    expect(vi.getTimerCount()).toBe(0);
    reduced = false;
    mediaListeners.forEach((callback) => callback());
    expect(controller!.getStatus()).toBe("listening");
    controller!.dispose();
    sample(60, 20);
    expect(controller!.getStatus()).toBe("stopped");
    expect(target.hasAttribute("data-glass-sensor")).toBe(false);
    expect(target.style.length).toBe(0);
    expect(mediaListeners.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not reactivate after unmount during a pending permission request", async () => {
    let resolve!: (value: "granted") => void;
    vi.stubGlobal("DeviceOrientationEvent", {
      requestPermission: () => new Promise<"granted">((done) => { resolve = done; }),
    });
    start();
    const permission = controller!.requestPermission();
    controller!.dispose();
    resolve("granted");
    expect(await permission).toBe("stopped");
    expect(target.style.length).toBe(0);
  });
});