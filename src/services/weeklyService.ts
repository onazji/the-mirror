import type { KeyValueStore } from "../storage/storage";
import type { MirrorSession, WeeklySummary, Energy, Urgency } from "../types/mirror";

const WEEKLY_LAST_COUNT_KEY = "mirror_weekly_last_count";

/**
 * LOCKED LOGIC:
 * Trigger every 7 sessions:
 * - if sessions.length % 7 === 0
 * - AND milestone not shown yet (tracked by mirror_weekly_last_count)
 */
export function shouldShowWeeklyCard(store: KeyValueStore, sessionsCount: number): boolean {
  if (sessionsCount === 0) return false;
  if (sessionsCount % 7 !== 0) return false;

  const raw = store.getString(WEEKLY_LAST_COUNT_KEY);
  const lastShown = raw ? Number(raw) : 0;
  if (!Number.isFinite(lastShown)) return true;

  return sessionsCount > lastShown;
}

export function markWeeklyCardShown(store: KeyValueStore, sessionsCount: number): void {
  store.setString(WEEKLY_LAST_COUNT_KEY, String(sessionsCount));
}

function mostFrequent<T extends string>(items: T[]): T | null {
  if (items.length === 0) return null;
  const map = new Map<T, number>();
  for (const it of items) map.set(it, (map.get(it) ?? 0) + 1);

  let best: T | null = null;
  let bestCount = -1;

  for (const [k, v] of map.entries()) {
    if (v > bestCount) {
      best = k;
      bestCount = v;
    }
  }
  return best;
}

/**
 * This MVP uses LAST 7 SESSIONS consistently.
 */
export function computeWeeklySummaryLast7(allSessions: MirrorSession[]): WeeklySummary {
  const slice = allSessions.slice(-7);
  const energies = slice.map(s => s.energy as Energy);
  const urgencies = slice.map(s => s.urgency as Urgency);

  const combos = slice.map(s => ${s.energy}+);
  const comboFreq = new Map<string, number>();
  for (const c of combos) comboFreq.set(c, (comboFreq.get(c) ?? 0) + 1);

  let bestCombo: string | null = null;
  let bestCount = 0;
  for (const [k, v] of comboFreq.entries()) {
    if (v > bestCount) {
      bestCombo = k;
      bestCount = v;
    }
  }

  return {
    energyMostFrequent: mostFrequent(energies),
    urgencyMostFrequent: mostFrequent(urgencies),
    mismatchMostCommon: { combo: bestCombo, count: bestCount },
    rangeCount: slice.length
  };
}
