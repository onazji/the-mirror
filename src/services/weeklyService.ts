import type { KeyValueStore } from "../storage/storage";
import type { MirrorSession, WeeklySummary, Energy, Pace } from "../types/mirror";

const WEEKLY_LAST_COUNT_KEY = "mirror_weekly_last_count";

/**
 * LOCKED LOGIC:
 * Trigger every 7 sessions:
 * - if sessions.length % 7 === 0
 * - AND milestone not shown yet (tracked by mirror_weekly_last_count)
 */
export function shouldShowWeeklyCard(
  store: KeyValueStore,
  sessionsCount: number
): boolean {
  if (sessionsCount === 0) return false;
  if (sessionsCount % 7 !== 0) return false;

  const raw = store.getString(WEEKLY_LAST_COUNT_KEY);
  const lastShown = raw ? Number(raw) : 0;
  if (!Number.isFinite(lastShown)) return true;

  return sessionsCount > lastShown;
}

export function markWeeklyCardShown(
  store: KeyValueStore,
  sessionsCount: number
): void {
  store.setString(WEEKLY_LAST_COUNT_KEY, String(sessionsCount));
}

function mostFrequent<T extends string>(items: T[]): T | null {
  if (items.length === 0) return null;

  const map = new Map<T, number>();

  for (const item of items) {
    map.set(item, (map.get(item) ?? 0) + 1);
  }

  let best: T | null = null;
  let bestCount = -1;

  for (const [key, count] of map.entries()) {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }

  return best;
}

/**
 * This MVP uses LAST 7 SESSIONS consistently.
 */
export function computeWeeklySummaryLast7(
  allSessions: MirrorSession[]
): WeeklySummary {
  const slice = allSessions.slice(-7);

  const energies = slice.map((session) => session.energy as Energy);
  const paces = slice.map((session) => session.pace as Pace);

  const combos = slice.map(
    (session) => `${session.energy}+${session.pace}`
  );

  const comboFreq = new Map<string, number>();

  for (const combo of combos) {
    comboFreq.set(combo, (comboFreq.get(combo) ?? 0) + 1);
  }

  let bestCombo: string | null = null;
  let bestCount = 0;

  for (const [combo, count] of comboFreq.entries()) {
    if (count > bestCount) {
      bestCombo = combo;
      bestCount = count;
    }
  }

  return {
    energyMostFrequent: mostFrequent(energies),
    paceMostFrequent: mostFrequent(paces),
    mismatchMostCommon: {
      combo: bestCombo,
      count: bestCount,
    },
    rangeCount: slice.length,
  };
}