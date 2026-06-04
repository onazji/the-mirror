import type { MirrorSession } from "../types/mirror";
import { getMirrorCard } from "./cardEngine";

export type WeeklyLayer = {
  totalEntries: number;
  seerHeld: number;
  seerPartial: number;
  seerMissed: number;
  appSessions: number;
  gameSessions: number;
  outputSessions: number;
  otherSessions: number;
  mostCommonCard: string | null;
  stateInsight: string | null;
  seerInsight: string;
  finalLine: string;
};

function getStateInsight(card: string | null): string | null {
  if (!card) return null;

  if (card === "Flow") return "I sustained forward motion without pressure.";
  if (card === "Alignment") return "I operated without internal resistance.";
  if (card === "Overdrive") return "I pushed with intensity.";
  if (card === "Drift") return "Energy was present, but direction was loose.";
  if (card === "Stagnant") return "Movement was minimal.";
  if (card === "Pressure") return "Effort was applied under weight.";
  if (card === "Anxiety") return "Movement carried tension and instability.";
  if (card === "Patience") return "Progress was slow, but controlled.";
  if (card === "Idle") return "Capacity was present, but unused.";

  return null;
}

function getSeerInsight(held: number, partial: number, missed: number): string {
  if (held > partial && held > missed) {
    return "I showed up for myself consistently.";
  }

  if (missed > held) {
    return "There were gaps in staying with myself.";
  }

  return "My consistency was mixed this week.";
}

export function buildWeeklyLayer(
  sessions: MirrorSession[],
  now: number = Date.now()
): WeeklyLayer {
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const recent = sessions.filter((session) => session.timestamp >= sevenDaysAgo);

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

    const card = getMirrorCard(session.energy, session.pace);
    cardCounts[card.title] = (cardCounts[card.title] ?? 0) + 1;
  }

  const mostCommonCard =
    Object.entries(cardCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const stateInsight = getStateInsight(mostCommonCard);
  const seerInsight = getSeerInsight(seerHeld, seerPartial, seerMissed);

  return {
    totalEntries: recent.length,
    seerHeld,
    seerPartial,
    seerMissed,
    appSessions,
    gameSessions,
    outputSessions,
    otherSessions: outputSessions,
    mostCommonCard,
    stateInsight,
    seerInsight,
    finalLine: "This is how I showed up for myself.",
  };
}
