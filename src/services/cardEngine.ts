import type { Energy, Pace } from "../types/mirror";

export type MirrorCardId =
  | "drift"
  | "flow"
  | "overdrive"
  | "idle"
  | "alignment"
  | "pressure"
  | "stagnant"
  | "patience"
  | "anxiety";

export type MirrorCard = {
  id: MirrorCardId;
  title: string;
  line: string;
};

export function getCardId(energy: Energy, pace: Pace): MirrorCardId {
  if (energy === "high" && pace === "low") return "drift";
  if (energy === "high" && pace === "steady") return "flow";
  if (energy === "high" && pace === "high") return "overdrive";

  if (energy === "steady" && pace === "low") return "idle";
  if (energy === "steady" && pace === "steady") return "alignment";
  if (energy === "steady" && pace === "high") return "pressure";

  if (energy === "low" && pace === "low") return "stagnant";
  if (energy === "low" && pace === "steady") return "patience";
  return "anxiety";
}

export const MIRROR_CARDS: Record<MirrorCardId, MirrorCard> = {
  drift: {
    id: "drift",
    title: "Drift",
    line: "I have energy, but nothing is directing it.",
  },

  flow: {
    id: "flow",
    title: "Flow",
    line: "My energy is moving with my pace.",
  },

  overdrive: {
    id: "overdrive",
    title: "Overdrive",
    line: "Everything is active at once.",
  },

  idle: {
    id: "idle",
    title: "Idle",
    line: "Nothing is demanding my attention right now.",
  },

  alignment: {
    id: "alignment",
    title: "Alignment",
    line: "Nothing is pulling me off course.",
  },

  pressure: {
    id: "pressure",
    title: "Pressure",
    line: "Something is asking for my attention now.",
  },

  stagnant: {
    id: "stagnant",
    title: "Stagnant",
    line: "Nothing is moving, and nothing is asking me to.",
  },

  patience: {
    id: "patience",
    title: "Patience",
    line: "I am moving slowly without being lost.",
  },

  anxiety: {
    id: "anxiety",
    title: "Anxiety",
    line: "Too much is asking from too little energy.",
  },
};

export function getMirrorCard(energy: Energy, pace: Pace): MirrorCard {
  const id = getCardId(energy, pace);
  return MIRROR_CARDS[id];
}