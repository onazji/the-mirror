import { describe, expect, it } from "vitest";
import { FREE_HISTORY_LIMIT, getRecentSessions } from "../src/services/historyService";
import type { MirrorSession } from "../src/types/mirror";

function makeSession(id: string, timestamp: number): MirrorSession {
  return {
    id,
    timestamp,
    energy: "steady",
    pace: "steady",
    body: "content",
    mind: "wide",
    seer: { anchor: false, integrity: false },
    work: {
      app: false,
      game: false,
      output: false,
      sessions: 1,
      note: "",
    },
    attention: "features",
    todaySignal: "",
    blocker: "",
    tomorrowStart: "Begin",
  };
}

describe("free recent history", () => {
  it("returns no more than the five newest reflections", () => {
    const sessions = Array.from({ length: 8 }, (_, index) =>
      makeSession(`reflection-${index}`, 100 + index)
    );

    const recent = getRecentSessions(sessions);

    expect(recent).toHaveLength(FREE_HISTORY_LIMIT);
    expect(recent.map((session) => session.id)).toEqual([
      "reflection-7",
      "reflection-6",
      "reflection-5",
      "reflection-4",
      "reflection-3",
    ]);
  });

  it("handles fewer than five reflections without padding or duplication", () => {
    const sessions = [makeSession("older", 10), makeSession("newer", 20)];
    expect(getRecentSessions(sessions).map((session) => session.id)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("sorts by timestamp and uses insertion order as a stable tie-breaker", () => {
    const sessions = [
      makeSession("first-same-time", 20),
      makeSession("oldest", 10),
      makeSession("second-same-time", 20),
    ];
    expect(getRecentSessions(sessions).map((session) => session.id)).toEqual([
      "second-same-time",
      "first-same-time",
      "oldest",
    ]);
  });
});
