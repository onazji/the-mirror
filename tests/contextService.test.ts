import { describe, expect, it } from "vitest";
import {
  buildReflectionActivity,
  buildStateDistribution,
  localDateKey,
} from "../src/services/contextService";
import type { Energy, MirrorSession, Pace } from "../src/types/mirror";

function session(
  id: string,
  timestamp: number,
  energy: Energy = "steady",
  pace: Pace = "steady"
): MirrorSession {
  return {
    id,
    timestamp,
    energy,
    pace,
    body: "content",
    mind: "wide",
    seer: { anchor: false, integrity: false },
    work: { app: false, game: false, output: false, sessions: 1, note: "" },
    attention: "features",
    todaySignal: "",
    blocker: "",
    tomorrowStart: "Begin",
  };
}

describe("Context state distribution", () => {
  it("returns all nine canonical states with counts and percentages", () => {
    const sessions = [
      session("one", 1, "steady", "steady"),
      session("two", 2, "steady", "steady"),
      session("three", 3, "low", "high"),
      session("four", 4, "high", "low"),
    ];
    const distribution = buildStateDistribution(sessions);

    expect(distribution).toHaveLength(9);
    expect(distribution[0]).toMatchObject({
      id: "alignment",
      count: 2,
      percentage: 50,
      rank: 1,
      highlighted: true,
    });
    expect(distribution.find((entry) => entry.id === "anxiety")?.percentage).toBe(25);
    expect(distribution.reduce((sum, entry) => sum + entry.count, 0)).toBe(4);
  });

  it("uses canonical ordering to break ties deterministically", () => {
    const distribution = buildStateDistribution([
      session("anxiety", 1, "low", "high"),
      session("drift", 2, "high", "low"),
    ]);
    expect(distribution.slice(0, 2).map((entry) => entry.id)).toEqual([
      "drift",
      "anxiety",
    ]);
  });

  it("handles an empty history without NaN percentages or highlights", () => {
    const distribution = buildStateDistribution([]);
    expect(distribution).toHaveLength(9);
    expect(distribution.every((entry) => entry.count === 0)).toBe(true);
    expect(distribution.every((entry) => entry.percentage === 0)).toBe(true);
    expect(distribution.some((entry) => entry.highlighted)).toBe(false);
  });
});

describe("Context reflection activity", () => {
  it("counts multiple reflections per local date and includes zero days", () => {
    const dayOneMorning = new Date(2026, 0, 1, 9).getTime();
    const dayOneEvening = new Date(2026, 0, 1, 20).getTime();
    const dayThree = new Date(2026, 0, 3, 10).getTime();
    const activity = buildReflectionActivity([
      session("one", dayOneMorning),
      session("two", dayOneEvening),
      session("three", dayThree),
    ]);

    expect(activity.map((point) => point.count)).toEqual([2, 0, 1]);
    expect(activity.map((point) => point.cumulative)).toEqual([2, 2, 3]);
  });

  it("uses local calendar boundaries", () => {
    const beforeMidnight = new Date(2026, 4, 8, 23, 59).getTime();
    const afterMidnight = new Date(2026, 4, 9, 0, 1).getTime();
    expect(localDateKey(beforeMidnight)).not.toBe(localDateKey(afterMidnight));
    expect(buildReflectionActivity([
      session("before", beforeMidnight),
      session("after", afterMidnight),
    ])).toHaveLength(2);
  });

  it("returns no points for an empty history", () => {
    expect(buildReflectionActivity([])).toEqual([]);
  });
});
