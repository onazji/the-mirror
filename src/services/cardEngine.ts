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
  meaning: string; // NEW
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
    meaning: "Energy is present, but there is no clear direction for it.",
  },

  flow: {
    id: "flow",
    title: "Flow",
    line: "My energy is moving with my pace.",
    meaning: "Energy and pace are working together in steady momentum.",
  },

  overdrive: {
    id: "overdrive",
    title: "Overdrive",
    line: "Everything is active at once.",
    meaning: "Both energy and pace are high, which can feel intense or overwhelming.",
  },

  idle: {
    id: "idle",
    title: "Idle",
    line: "Nothing is demanding my attention right now.",
    meaning: "There is capacity available, but nothing is currently pulling for action.",
  },

  alignment: {
    id: "alignment",
    title: "Alignment",
    line: "Nothing is pulling me off course.",
    meaning: "Energy and pace are balanced, creating a stable and clear state.",
  },

  pressure: {
    id: "pressure",
    title: "Pressure",
    line: "Something is asking for my attention now.",
    meaning: "Demands are rising and require action or response.",
  },

  stagnant: {
    id: "stagnant",
    title: "Stagnant",
    line: "Nothing is moving, and nothing is asking me to.",
    meaning: "Energy and movement are both low, resulting in little progress.",
  },

  patience: {
    id: "patience",
    title: "Patience",
    line: "I am moving slowly without being lost.",
    meaning: "Progress is steady but slow, without confusion or urgency.",
  },

  anxiety: {
    id: "anxiety",
    title: "Anxiety",
    line: "Too much is asking from too little energy.",
    meaning: "Demands feel higher than the available energy to meet them.",
  },
};

export function getMirrorCard(energy: Energy, pace: Pace): MirrorCard {
  const id = getCardId(energy, pace);
  return MIRROR_CARDS[id];
}