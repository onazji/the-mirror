import { beforeEach, describe, expect, it } from "vitest";
import {
  ECHO_STATE_KEY,
  ECHO_SURFACE_COOLDOWN_MS,
  findEchoCandidate,
  loadEchoState,
  MIN_ECHO_SEPARATION_MS,
  surfaceEchoForSession,
} from "../src/services/echoService";
import type { KeyValueStore } from "../src/storage/storage";
import type { EchoState } from "../src/types/echo";
import type { MirrorSession } from "../src/types/mirror";

class MemoryStore implements KeyValueStore {
  values = new Map<string, string>();
  getString(key: string) { return this.values.get(key) ?? null; }
  setString(key: string, value: string) { this.values.set(key, value); return true; }
  remove(key: string) { this.values.delete(key); return true; }
}

const DAY = 24 * 60 * 60 * 1000;
const emptyState: EchoState = { version: 1, introductoryEchoUsed: false, records: [] };

function makeSession(
  id: string,
  timestamp: number,
  overrides: Partial<MirrorSession> = {}
): MirrorSession {
  return {
    id,
    timestamp,
    energy: "steady",
    pace: "high",
    body: "relaxed",
    mind: "wide",
    seer: { anchor: true, integrity: true },
    work: {
      app: true,
      game: false,
      output: false,
      creative: false,
      physical: false,
      sessions: 1,
      hours: 0,
      minutes: 45,
      note: "",
    },
    attention: "features",
    todaySignal: `Proof ${id}`,
    blocker: "",
    tomorrowStart: "Continue",
    ...overrides,
  };
}

describe("Echo matching", () => {
  let store: MemoryStore;

  beforeEach(() => { store = new MemoryStore(); });

  it("prefers a normalized reusable custom activity over a broad category", () => {
    const earlier = makeSession("earlier", 0, {
      work: { ...makeSession("x", 0).work, output: true, customActivity: "Game Development" },
    });
    const later = makeSession("later", 10 * DAY, {
      work: { ...makeSession("x", 0).work, output: true, customActivity: "  game   development  " },
    });

    expect(findEchoCandidate(later, [earlier, later], emptyState)?.matchedActivity)
      .toMatchObject({ kind: "custom", key: "custom:game development" });
  });

  it("matches a broad Work category with matching Energy and Momentum", () => {
    const earlier = makeSession("earlier", 0);
    const later = makeSession("later", 8 * DAY);

    expect(findEchoCandidate(later, [earlier, later], emptyState)).toMatchObject({
      earlierSessionId: "earlier",
      laterSessionId: "later",
      matchedActivity: { kind: "category", label: "Personal" },
      energy: "steady",
      pace: "high",
    });
  });

  it("does not use differently defaulted Presence or Focus as evidence", () => {
    const earlier = makeSession("earlier", 0, { body: "tense", mind: "narrow" });
    const later = makeSession("later", 8 * DAY, { body: "relaxed", mind: "wide" });

    expect(findEchoCandidate(later, [earlier, later], emptyState)).not.toBeNull();
  });

  it("requires both Energy and Momentum to match", () => {
    const earlier = makeSession("earlier", 0);
    const energyMismatch = makeSession("energy", 8 * DAY, { energy: "low" });
    const paceMismatch = makeSession("pace", 8 * DAY, { pace: "steady" });

    expect(findEchoCandidate(energyMismatch, [earlier, energyMismatch], emptyState)).toBeNull();
    expect(findEchoCandidate(paceMismatch, [earlier, paceMismatch], emptyState)).toBeNull();
  });

  it("does not treat generic Other without a reusable custom activity as a match", () => {
    const work = { ...makeSession("x", 0).work, app: false, output: true, customActivity: "" };
    const earlier = makeSession("earlier", 0, { work });
    const later = makeSession("later", 8 * DAY, { work });
    expect(findEchoCandidate(later, [earlier, later], emptyState)).toBeNull();
  });

  it("requires the documented seven-day separation", () => {
    const earlier = makeSession("earlier", 0);
    const tooSoon = makeSession("too-soon", MIN_ECHO_SEPARATION_MS - 1);
    const eligible = makeSession("eligible", MIN_ECHO_SEPARATION_MS);
    expect(findEchoCandidate(tooSoon, [earlier, tooSoon], emptyState)).toBeNull();
    expect(findEchoCandidate(eligible, [earlier, eligible], emptyState)).not.toBeNull();
  });

  it("uses deterministic stable pair IDs and ignores proof wording", () => {
    const earlier = makeSession("earlier", 0, { todaySignal: "Started the sketch" });
    const later = makeSession("later", 9 * DAY, { todaySignal: "Finished animation" });
    expect(findEchoCandidate(later, [earlier, later], emptyState)?.id)
      .toBe("echo:earlier:later");
  });

  it("suppresses duplicate pairs and excessive frequency", () => {
    const first = makeSession("first", 0);
    const second = makeSession("second", 8 * DAY);
    const firstResult = surfaceEchoForSession(store, second, [first, second], "premium", 1);
    expect(firstResult.echo).not.toBeNull();
    expect(surfaceEchoForSession(store, second, [first, second], "premium", 2).echo).toBeNull();

    const third = makeSession("third", 8 * DAY + ECHO_SURFACE_COOLDOWN_MS - 1);
    expect(surfaceEchoForSession(store, third, [first, second, third], "premium", 3).echo)
      .toBeNull();
  });

  it("offers exactly one introductory free Echo and allows later Premium discoveries", () => {
    const first = makeSession("first", 0);
    const second = makeSession("second", 8 * DAY);
    const intro = surfaceEchoForSession(store, second, [first, second], "free", 1);
    expect(intro.echo?.introductory).toBe(true);
    expect(intro.state.introductoryEchoUsed).toBe(true);

    const third = makeSession("third", 12 * DAY);
    expect(surfaceEchoForSession(store, third, [first, second, third], "free", 2).echo)
      .toBeNull();
    expect(surfaceEchoForSession(store, third, [first, second, third], "premium", 3).echo)
      .not.toBeNull();
  });

  it("persists the collection and removes references whose source is missing", () => {
    const first = makeSession("first", 0);
    const second = makeSession("second", 8 * DAY);
    surfaceEchoForSession(store, second, [first, second], "free", 1);
    expect(loadEchoState(store, [first, second]).records).toHaveLength(1);
    expect(loadEchoState(store, [second]).records).toEqual([]);
    expect(store.getString(ECHO_STATE_KEY)).not.toBeNull();
  });

  it("surfaces nothing when no activity matches", () => {
    const earlier = makeSession("earlier", 0);
    const later = makeSession("later", 8 * DAY, {
      work: { ...makeSession("x", 0).work, app: false, game: true },
    });
    expect(findEchoCandidate(later, [earlier, later], emptyState)).toBeNull();
  });
});
