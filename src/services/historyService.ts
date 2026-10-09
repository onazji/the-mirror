import type { MirrorSession } from "../types/mirror";

export const FREE_HISTORY_LIMIT = 5;

export function getRecentSessions(
  sessions: MirrorSession[],
  limit = FREE_HISTORY_LIMIT
): MirrorSession[] {
  if (limit <= 0) return [];

  return sessions
    .map((session, index) => ({ session, index }))
    .sort(
      (left, right) =>
        right.session.timestamp - left.session.timestamp ||
        right.index - left.index
    )
    .slice(0, limit)
    .map(({ session }) => session);
}
