import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExploreButton } from "../src/components/ExploreButton";
import { ExploreModal } from "../src/components/ExploreModal";
import type { MirrorSession } from "../src/types/mirror";

function makeSession(id: string, timestamp: number): MirrorSession {
  return {
    id,
    timestamp,
    energy: "steady",
    pace: "high",
    body: "content",
    mind: "narrow",
    seer: { anchor: true, integrity: false },
    work: {
      app: true,
      game: false,
      output: false,
      sessions: 2,
      hours: 1,
      minutes: 15,
      note: `Work note ${id}`,
    },
    attention: "features",
    todaySignal: `Signal ${id}`,
    blocker: `Friction ${id}`,
    tomorrowStart: `Tomorrow ${id}`,
  };
}

describe("Explore interface", () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it("provides a named, keyboard-operable Explore button", () => {
    const onClick = vi.fn();
    act(() => root.render(<ExploreButton onClick={onClick} />));

    const button = container.querySelector('button[aria-label="Explore"]');
    expect(button).not.toBeNull();
    expect(button?.querySelectorAll("rect")).toHaveLength(4);
    act(() => (button as HTMLButtonElement).click());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("exposes accessible tabs and supports arrow-key navigation", () => {
    act(() => root.render(<ExploreModal sessions={[]} onClose={vi.fn()} />));

    const dialog = container.querySelector('[role="dialog"]');
    const tabs = [...container.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["History", "Context", "Echoes"]);
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");

    act(() => {
      tabs[0].focus();
      tabs[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    });

    expect(tabs[1].getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(tabs[1]);
    expect(container.querySelector('[role="tabpanel"]')?.textContent).toContain(
      "See what you recorded over time"
    );
  });

  it("closes with Escape", () => {
    const onClose = vi.fn();
    act(() => root.render(<ExploreModal sessions={[]} onClose={onClose} />));
    act(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("limits free History to five records and opens original details", () => {
    const sessions = Array.from({ length: 7 }, (_, index) =>
      makeSession(`reflection-${index}`, 1_700_000_000_000 + index)
    );
    act(() => root.render(<ExploreModal sessions={sessions} onClose={vi.fn()} />));

    const historyButtons = [
      ...container.querySelectorAll<HTMLButtonElement>('button[aria-label^="Open "]'),
    ];
    expect(historyButtons).toHaveLength(5);
    expect(container.textContent).toContain("2 earlier reflections remain safely stored");

    act(() => historyButtons[0].click());
    expect(container.textContent).toContain("Signal reflection-6");
    expect(container.textContent).toContain("Friction reflection-6");
    expect(container.textContent).toContain("Tomorrow reflection-6");
    expect(container.textContent).toContain("Work note reflection-6");
  });

  it("incrementally exposes a complete large archive with Premium access", () => {
    const sessions = Array.from({ length: 35 }, (_, index) =>
      makeSession(`reflection-${index}`, index)
    );
    act(() =>
      root.render(
        <ExploreModal sessions={sessions} historyAccess="premium" onClose={vi.fn()} />
      )
    );

    expect(container.querySelectorAll('button[aria-label^="Open "]')).toHaveLength(30);
    const loadMore = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Load older reflections"
    );
    expect(loadMore).not.toBeUndefined();
    act(() => (loadMore as HTMLButtonElement).click());
    expect(container.querySelectorAll('button[aria-label^="Open "]')).toHaveLength(35);
    expect(container.textContent).not.toContain("remain safely stored on this device");
  });
});
