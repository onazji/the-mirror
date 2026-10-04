import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ReflectiveTransition,
  REFLECTIVE_TRANSITION_DURATION_MS,
} from "../src/components/ReflectiveTransition";
import { SELENITE_SWAP_MS } from "../src/components/seleniteMaterial";

describe("selenite transition sequencing", () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(0), 0));
    vi.stubGlobal("cancelAnimationFrame", (handle: number) => window.clearTimeout(handle));
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      disconnect() {}
    });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("swaps at full crystalline cover and completes at the centralized duration", () => {
    const onSwap = vi.fn();
    const onComplete = vi.fn();
    act(() => root.render(
      <ReflectiveTransition direction="down" onSwap={onSwap} onComplete={onComplete} />,
    ));

    act(() => vi.advanceTimersByTime(SELENITE_SWAP_MS - 1));
    expect(onSwap).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onSwap).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(REFLECTIVE_TRANSITION_DURATION_MS - SELENITE_SWAP_MS));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("swaps immediately for reduced motion without a long navigation lock", () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    const onSwap = vi.fn();
    const onComplete = vi.fn();
    act(() => root.render(
      <ReflectiveTransition direction="down" onSwap={onSwap} onComplete={onComplete} />,
    ));

    expect(onSwap).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(0));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("clears pending navigation timers when the layer unmounts", () => {
    const onSwap = vi.fn();
    const onComplete = vi.fn();
    act(() => root.render(
      <ReflectiveTransition direction="up" onSwap={onSwap} onComplete={onComplete} />,
    ));
    act(() => root.render(null));
    act(() => vi.advanceTimersByTime(REFLECTIVE_TRANSITION_DURATION_MS));
    expect(onSwap).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("uses the same lightweight distributed material in both navigation directions", () => {
    const props = { onSwap: vi.fn(), onComplete: vi.fn() };
    act(() => root.render(<ReflectiveTransition direction="down" {...props} />));
    const down = [...container.querySelectorAll("[class*='field']")].map((field) =>
      field.getAttribute("style")
    );
    expect(down).toHaveLength(3);
    expect(container.querySelector("svg")).toBeNull();
    act(() => root.render(<ReflectiveTransition direction="up" {...props} />));
    expect([...container.querySelectorAll("[class*='field']")].map((field) =>
      field.getAttribute("style")
    )).toEqual(down);
  });

  it("keeps physically validated timing exact and material independent of optical input", () => {
    expect(REFLECTIVE_TRANSITION_DURATION_MS).toBe(2100);
    expect(SELENITE_SWAP_MS).toBe(1302);
    act(() => root.render(
      <ReflectiveTransition direction="down" onSwap={vi.fn()} onComplete={vi.fn()} />,
    ));
    const before = container.innerHTML;
    document.documentElement.style.setProperty("--mirror-tilt-x", "1");
    document.documentElement.style.setProperty("--mirror-specular-angle", "5deg");
    expect(container.innerHTML).toEqual(before);
    document.documentElement.style.removeProperty("--mirror-tilt-x");
    document.documentElement.style.removeProperty("--mirror-specular-angle");
  });
});
