import { describe, expect, test, beforeEach } from "vitest";
import type { KeyValueStore } from "../src/storage/storage";
import type { MirrorSession } from "../src/types/mirror";
import {
shouldShowWeeklyCard,
markWeeklyCardShown,
computeWeeklySummaryLast7,
} from "../src/services/weeklyService";
class MemoryStore implements KeyValueStore {
private m = new Map<string, string>();
getString(key: string) {
return this.m.get(key) ?? null;
}
setString(key: string, value: string) {
this.m.set(key, value);
}
remove(key: string) {
this.m.delete(key);
}
}
let store: MemoryStore;
beforeEach(() => {
store = new MemoryStore();
});
function makeSession(
id: string,
timestamp: number,
energy: MirrorSession["energy"],
pace: MirrorSession["pace"],
body: MirrorSession["body"] = "relaxed",
mind: MirrorSession["mind"] = "wide"
): MirrorSession {
return {
id,
timestamp,
energy,
pace,
body,
mind,
seer: {
anchor: false,
integrity: false,
},
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
tomorrowStart: "test tomorrow start",
};
}
test("weekly trigger fires on multiples of 7 and not otherwise", () => {
expect(shouldShowWeeklyCard(store, 6)).toBe(false);
expect(shouldShowWeeklyCard(store, 7)).toBe(true);
markWeeklyCardShown(store, 7);
expect(shouldShowWeeklyCard(store, 7)).toBe(false);
expect(shouldShowWeeklyCard(store, 14)).toBe(true);
});
test("weekly summary uses last 7 sessions consistently", () => {
const base = 1700000000000;
const mk = (
i: number,
energy: MirrorSession["energy"],
pace: MirrorSession["pace"]
): MirrorSession => makeSession(`session-${i}`, base + i, energy, pace);
const sessions: MirrorSession[] = [
mk(1, "low", "low"),
mk(2, "low", "low"),
mk(3, "steady", "steady"),
mk(4, "steady", "steady"),
mk(5, "steady", "high"),
mk(6, "high", "high"),
mk(7, "steady", "steady"),
mk(8, "steady", "steady"),
mk(9, "low", "steady"),
];
const sum = computeWeeklySummaryLast7(sessions);
expect(sum.energyMostFrequent).toBe("steady");
expect(sum.paceMostFrequent).toBe("steady");
expect(sum.mismatchMostCommon.combo).toBe("steady+steady");
expect(sum.rangeCount).toBe(7);
});
describe("edge cases", () => {
test("summary handles fewer than 7 sessions", () => {
const sessions: MirrorSession[] = [
makeSession("a", 1, "low", "high", "tense", "scattered"),
];
const sum = computeWeeklySummaryLast7(sessions);
expect(sum.rangeCount).toBe(1);
expect(sum.energyMostFrequent).toBe("low");
expect(sum.paceMostFrequent).toBe("high");
expect(sum.mismatchMostCommon.combo).toBe("low+high");
});
});