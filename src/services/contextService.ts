import {
  MIRROR_CARDS,
  getCardId,
  type MirrorCardId,
} from "./cardEngine";
import type { MirrorSession } from "../types/mirror";

export type StateDistributionEntry = {
  id: MirrorCardId;
  title: string;
  count: number;
  percentage: number;
  rank: number;
  highlighted: boolean;
};

export type ReflectionActivityPoint = {
  dateKey: string;
  dateLabel: string;
  count: number;
  cumulative: number;
};

const CANONICAL_STATE_ORDER = Object.keys(MIRROR_CARDS) as MirrorCardId[];

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

export function buildStateDistribution(
  sessions: MirrorSession[]
): StateDistributionEntry[] {
  const counts = new Map<MirrorCardId, number>(
    CANONICAL_STATE_ORDER.map((id) => [id, 0])
  );

  sessions.forEach((session) => {
    const id = getCardId(session.energy, session.pace);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  });

  const total = sessions.length;
  return CANONICAL_STATE_ORDER.map((id, canonicalIndex) => ({
    id,
    canonicalIndex,
    title: MIRROR_CARDS[id].title,
    count: counts.get(id) ?? 0,
  }))
    .sort((left, right) => right.count - left.count || left.canonicalIndex - right.canonicalIndex)
    .map(({ canonicalIndex: _canonicalIndex, ...entry }, index) => ({
      ...entry,
      percentage: total === 0 ? 0 : (entry.count / total) * 100,
      rank: index + 1,
      highlighted: total > 0 && index < 3,
    }));
}

export function localDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildReflectionActivity(
  sessions: MirrorSession[]
): ReflectionActivityPoint[] {
  if (sessions.length === 0) return [];

  const counts = new Map<string, number>();
  sessions.forEach((session) => {
    const key = localDateKey(session.timestamp);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const timestamps = sessions.map((session) => session.timestamp);
  const first = new Date(Math.min(...timestamps));
  const last = new Date(Math.max(...timestamps));
  const cursor = new Date(first.getFullYear(), first.getMonth(), first.getDate(), 12);
  const finalDate = new Date(last.getFullYear(), last.getMonth(), last.getDate(), 12);
  const points: ReflectionActivityPoint[] = [];
  let cumulative = 0;

  while (cursor <= finalDate) {
    const key = localDateKey(cursor.getTime());
    const count = counts.get(key) ?? 0;
    cumulative += count;
    points.push({
      dateKey: key,
      dateLabel: shortDateFormatter.format(cursor),
      count,
      cumulative,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return points;
}
