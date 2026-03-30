import { describe, expect, test, beforeEach } from "vitest";
import type { KeyValueStore } from "../src/storage/storage";
import type { MirrorSession } from "../src/types/mirror";
import {
  shouldShowWeeklyCard,
  markWeeklyCardShown,
  computeWeeklySummaryLast7
} from "../src/services/weeklyService";

class MemoryStore implements KeyValueStore {
  private m = new Map<string, string>();
  getString(key: string) { return this.m.get(key) ?? null; }
  setString(key: string, value: string) { this.m.set(key, value); }
  remove(key: string) { this.m.delete(key); }
}

let store: MemoryStore;

beforeEach(() => {
  store = new MemoryStore();
});

test("weekly trigger fires on multiples of 7 and not otherwise", () => {
  expect(shouldShowWeeklyCard(store, 6)).toBe(false);
  expect(shouldShowWeeklyCard(store, 7)).toBe(true);
  markWeeklyCardShown(store, 7);
  expect(shouldShowWeeklyCard(store, 7)).toBe(false);
  expect(shouldShowWeeklyCard(store, 14)).toBe(true);
});

test("weekly summary uses last 7 sessions consistently", () => {
  const base = 1700000000000;

  const mk = (i: number, energy: MirrorSession["energy"], urgency: MirrorSession["urgency"]): MirrorSession => ({
    id: s,
    timestamp: base + i,
    energy,
    urgency,
    body: "relaxed",
    mind: "wide"
  });

  const sessions: MirrorSession[] = [
    mk(1, "low", "low"),
    mk(2, "low", "low"),
    mk(3, "steady", "medium"),
    mk(4, "steady", "medium"),
    mk(5, "steady", "high"),
    mk(6, "high", "high"),
    mk(7, "steady", "medium"),
    mk(8, "steady", "medium"),
    mk(9, "low", "medium")
  ];

  const sum = computeWeeklySummaryLast7(sessions);
  expect(sum.energyMostFrequent).toBe("steady");
  expect(sum.urgencyMostFrequent).toBe("medium");
  expect(sum.mismatchMostCommon.combo).toBe("steady+medium");
  expect(sum.rangeCount).toBe(7);
});

describe("edge cases", () => {
  test("summary handles fewer than 7 sessions", () => {
    const sessions: MirrorSession[] = [
      { id: "a", timestamp: 1, energy: "low", urgency: "high", body: "tense", mind: "scattered" }
    ];
    const sum = computeWeeklySummaryLast7(sessions);
    expect(sum.rangeCount).toBe(1);
    expect(sum.energyMostFrequent).toBe("low");
    expect(sum.urgencyMostFrequent).toBe("high");
    expect(sum.mismatchMostCommon.combo).toBe("low+high");
  });
});
