import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EchoComparison } from "../src/components/EchoComparison";
import { EchoInvitation } from "../src/components/EchoInvitation";
import { EchoCollection } from "../src/components/EchoCollection";
import type { EchoRecord } from "../src/types/echo";
import type { MirrorSession } from "../src/types/mirror";

function session(id: string, timestamp: number): MirrorSession {
  return {
    id,
    timestamp,
    energy: "steady",
    pace: "high",
    body: "content",
    mind: "wide",
    seer: { anchor: true, integrity: false },
    work: { app: true, game: false, output: false, sessions: 2, hours: 1, minutes: 15, note: "" },
    attention: "features",
    todaySignal: `Signal ${id}`,
    blocker: `Friction ${id}`,
    tomorrowStart: `Tomorrow ${id}`,
  };
}

const echo: EchoRecord = {
  id: "echo:earlier:later",
  earlierSessionId: "earlier",
  laterSessionId: "later",
  surfacedAt: 1,
  matchedActivity: { kind: "category", key: "category:personal", label: "Personal" },
  energy: "steady",
  pace: "high",
  introductory: true,
  viewed: false,
};

describe("Echo interface", () => {
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

  it("keeps the invitation under user control", () => {
    const onExplore = vi.fn();
    const onDismiss = vi.fn();
    act(() => root.render(<EchoInvitation onExplore={onExplore} onDismiss={onDismiss} />));
    expect(container.textContent).toContain("An Echo has surfaced.");
    expect(container.textContent).toContain("A familiar moment has appeared before.");
    const buttons = [...container.querySelectorAll("button")];
    act(() => buttons.find((button) => button.textContent === "Not now")?.click());
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onExplore).not.toHaveBeenCalled();
  });

  it("shows only factual paired details and leaves interpretation to the user", () => {
    const sessions = [session("earlier", 0), session("later", 10_000)];
    act(() => root.render(<EchoComparison echo={echo} sessions={sessions} onClose={vi.fn()} />));
    expect(container.textContent).toContain("Both reflections recorded Personal");
    expect(container.textContent).toContain("Signal earlier");
    expect(container.textContent).toContain("Signal later");
    expect(container.textContent).toContain("What do you notice?");
    expect(container.textContent).not.toMatch(/improved|regressed|healed|unhealthy/i);
  });

  it("keeps the introductory Echo visible while reserving the full collection for Premium", () => {
    const earlier = session("earlier", 0);
    const later = session("later", 10_000);
    const newest = session("newest", 20_000);
    const premiumEcho: EchoRecord = {
      ...echo,
      id: "echo:later:newest",
      earlierSessionId: "later",
      laterSessionId: "newest",
      introductory: false,
    };

    act(() => root.render(
      <EchoCollection
        echoes={[echo, premiumEcho]}
        sessions={[earlier, later, newest]}
        accessLevel="free"
        onOpenEcho={vi.fn()}
      />
    ));
    expect(container.querySelectorAll('button')).toHaveLength(1);
    expect(container.textContent).toContain("1 additional Echo");

    act(() => root.render(
      <EchoCollection
        echoes={[echo, premiumEcho]}
        sessions={[earlier, later, newest]}
        accessLevel="premium"
        onOpenEcho={vi.fn()}
      />
    ));
    expect(container.querySelectorAll('button')).toHaveLength(2);
  });
});
