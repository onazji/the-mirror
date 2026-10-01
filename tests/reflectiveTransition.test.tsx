import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ReflectiveTransition,
  REFLECTIVE_TRANSITION_DURATION_MS,
} from "../src/components/ReflectiveTransition";

describe("selenite transition sequencing", () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false })));
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

    act(() => vi.advanceTimersByTime(1799));
    expect(onSwap).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onSwap).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(REFLECTIVE_TRANSITION_DURATION_MS - 1800));
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
});