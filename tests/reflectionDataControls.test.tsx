import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReflectionDataControls } from "../src/components/ReflectionDataControls";

function click(element: Element | null) {
  if (!(element instanceof HTMLElement)) throw new Error("Expected clickable element");
  act(() => element.click());
}

describe("reflection data controls", () => {
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

  it("requires explicit confirmation before deleting all reflections", () => {
    const onDeleteAll = vi.fn();
    act(() =>
      root.render(
        <ReflectionDataControls
          reflectionCount={3}
          onExport={vi.fn()}
          onDeleteAll={onDeleteAll}
        />
      )
    );

    click([...container.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("Delete reflection history")
    ) ?? null);
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(onDeleteAll).not.toHaveBeenCalled();

    click([...container.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("Delete all reflections")
    ) ?? null);
    expect(onDeleteAll).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it("keeps deletion unavailable when there is no reflection history", () => {
    act(() =>
      root.render(
        <ReflectionDataControls
          reflectionCount={0}
          onExport={vi.fn()}
          onDeleteAll={vi.fn()}
        />
      )
    );

    const deleteButton = [...container.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("Delete reflection history")
    );
    expect(deleteButton?.disabled).toBe(true);
  });
});
