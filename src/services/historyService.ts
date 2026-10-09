import type { MirrorSession } from "../types/mirror";

export const FREE_HISTORY_LIMIT = 5;
export const HISTORY_PAGE_SIZE = 30;

export type HistoryAccessLevel = "free" | "premium";

export type HistoryAccessView = {
  sessions: MirrorSession[];
  totalCount: number;
  hiddenCount: number;
};

export function sortSessionsNewestFirst(sessions: MirrorSession[]): MirrorSession[] {
  return sessions
    .map((session, index) => ({ session, index }))
    .sort(
      (left, right) =>
        right.session.timestamp - left.session.timestamp ||
        right.index - left.index
    )
    .map(({ session }) => session);
}

export function getRecentSessions(
  sessions: MirrorSession[],
  limit = FREE_HISTORY_LIMIT
): MirrorSession[] {
  if (limit <= 0) return [];

  return sortSessionsNewestFirst(sessions).slice(0, limit);
}

export function getHistoryAccessView(
  sessions: MirrorSession[],
  accessLevel: HistoryAccessLevel
): HistoryAccessView {
  const sorted = sortSessionsNewestFirst(sessions);
  const visible =
    accessLevel === "premium" ? sorted : sorted.slice(0, FREE_HISTORY_LIMIT);

  return {
    sessions: visible,
    totalCount: sorted.length,
    hiddenCount: sorted.length - visible.length,
  };
}
