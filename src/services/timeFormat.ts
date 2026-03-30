export function formatTimeAgo(nowMs: number, pastMs: number): string {
  const diff = Math.max(0, nowMs - pastMs);
  const min = Math.floor(diff / 60000);

  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;

  const hrs = Math.floor(min / 60);
  if (hrs < 24) return '${hrs} hrs ago';

  const days = Math.floor(hrs / 24);
  return '${days} days ago';
}

export function missedDaysSince(nowMs: number, pastMs: number): number {
  const diff = Math.max(0, nowMs - pastMs);
  return Math.floor(diff / (24 * 60 * 60 * 1000));
}
///end of code///