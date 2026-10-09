import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExploreButton } from "../src/components/ExploreButton";
import { ExploreModal } from "../src/components/ExploreModal";

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
});
