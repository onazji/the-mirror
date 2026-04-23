import type { AttentionTag, MirrorSession } from "../types/mirror";
import { getMirrorCard } from "./cardEngine";

export type WeeklyLayer = {
  totalEntries: number;
  seerHeld: number;
  seerPartial: number;
  seerMissed: number;
  appSessions: number;
  gameSessions: number;
  outputSessions: number;
  mostCommonCard: string | null;
  attentionCounts: Record<AttentionTag, number>;
  finalLine: string;
};

const ATTENTION_TAGS: AttentionTag[] = [
  "waste",
  "bugs",
  "features",
  "brainstorm",
];

export function buildWeeklyLayer(
  sessions: MirrorSession[],
  now: number = Date.now()
): WeeklyLayer {
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const recent = sessions.filter((session) => session.timestamp >= sevenDaysAgo);

  const attentionCounts: Record<AttentionTag, number> = {
    waste: 0,
    bugs: 0,
    features: 0,
    brainstorm: 0,
  };

  const cardCounts: Record<string, number> = {};

  let seerHeld = 0;
  let seerPartial = 0;
  let seerMissed = 0;

  let appSessions = 0;
  let gameSessions = 0;
  let outputSessions = 0;

  for (const session of recent) {
    const anchor = session.seer?.anchor ?? false;
    const integrity = session.seer?.integrity ?? false;

    if (anchor && integrity) {
      seerHeld += 1;
    } else if (anchor || integrity) {
      seerPartial += 1;
    } else {
      seerMissed += 1;
    }

    if (session.work?.app) appSessions += session.work.sessions ?? 1;
    if (session.work?.game) gameSessions += session.work.sessions ?? 1;
    if (session.work?.output) outputSessions += session.work.sessions ?? 1;

    const attention = session.attention;
    if (ATTENTION_TAGS.includes(attention)) {
      attentionCounts[attention] += 1;
    }

    const card = getMirrorCard(session.energy, session.pace);
    cardCounts[card.title] = (cardCounts[card.title] ?? 0) + 1;
  }

  const mostCommonCard =
    Object.entries(cardCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    totalEntries: recent.length,
    seerHeld,
    seerPartial,
    seerMissed,
    appSessions,
    gameSessions,
    outputSessions,
    mostCommonCard,
    attentionCounts,
    finalLine: "This is how I showed up for myself.",
  };
}