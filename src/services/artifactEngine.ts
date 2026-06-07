import type { MirrorSession } from "../types/mirror";
import { getMirrorCard } from "./cardEngine";

console.log("[LivingMirror] Loaded 6 canonical mirror states.");
console.log("[LivingMirror] Visual progression: 0 → 1 → 2 → 3 → 4 → 7");

export const TIER_IMAGES: readonly string[] = [
  "/artifacts/mirror-tier-0.png", // 0 — Dormant
  "/artifacts/mirror-tier-1.png", // 1 — Arrival
  "/artifacts/mirror-tier-2.png", // 2 — Reception
  "/artifacts/mirror-tier-3.png", // 3 — Transmission
  "/artifacts/mirror-tier-4.png", // 4 — Recursion
  "/artifacts/mirror-tier-5.png", // 7 — Awakening
];

export const TIER_NAMES: readonly string[] = [
  "Dormant",
  "Arrival",
  "Reception",
  "Transmission",
  "Recursion",
  "Awakening",
];

function getVisualTier(reflections: number): number {
  if (reflections >= 7) return 5;
  if (reflections >= 5) return 4;
  return reflections;
}

export type ArtifactStats = {
  tier: number;
  tierImage: string;
  tierName: string;
  totalReflections: number;
  daysSinceFirst: number;
  mostReflectedState: string | null;
};

export function computeArtifactStats(
  sessions: MirrorSession[],
  now: number = Date.now()
): ArtifactStats {
  const totalReflections = sessions.length;
  const tier = getVisualTier(totalReflections);
  const tierImage = TIER_IMAGES[tier];
  const tierName = TIER_NAMES[tier];

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
    tierName,
    totalReflections,
    daysSinceFirst,
    mostReflectedState,
  };
}
