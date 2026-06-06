import type { MirrorSession } from "../types/mirror";
import { getMirrorCard } from "./cardEngine";

const TIER_IMAGES: readonly string[] = [
  "/artifacts/mirror-tier-0.png",
  "/artifacts/mirror-tier-1.png",
  "/artifacts/mirror-tier-2.png",
  "/artifacts/mirror-tier-3.png",
  "/artifacts/mirror-tier-4.png",
  "/artifacts/mirror-tier-5.png",
  "/artifacts/mirror-tier-6.png",
  "/artifacts/mirror-tier-7.png",
  "/artifacts/mirror-tier-8.png",
];

export type ArtifactStats = {
  tier: number;
  tierImage: string;
  totalReflections: number;
  daysSinceFirst: number;
  mostReflectedState: string | null;
};

export function computeArtifactStats(
  sessions: MirrorSession[],
  now: number = Date.now()
): ArtifactStats {
  const totalReflections = sessions.length;
  const tier = Math.min(totalReflections, 8);
  const tierImage = TIER_IMAGES[tier];

  const daysSinceFirst =
    sessions.length > 0
      ? Math.floor((now - sessions[0].timestamp) / (1000 * 60 * 60 * 24))
      : 0;

  const cardCounts: Record<string, number> = {};
  for (const session of sessions) {
    const card = getMirrorCard(session.energy, session.pace);
    cardCounts[card.title] = (cardCounts[card.title] ?? 0) + 1;
  }

  const mostReflectedState =
    Object.entries(cardCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    tier,
    tierImage,
    totalReflections,
    daysSinceFirst,
    mostReflectedState,
  };
}
