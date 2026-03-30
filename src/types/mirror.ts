export type Energy = "low" | "steady" | "high";
export type Urgency = "low" | "medium" | "high";
export type Body = "relaxed" | "tense";
export type Mind = "narrow" | "wide" | "scattered";

export type MirrorSession = {
  id: string;
  timestamp: number;
  energy: Energy;
  urgency: Urgency;
  body: Body;
  mind: Mind;
  note?: string;
};

export type MirrorDraft = {
  energy: Energy | null;
  urgency: Urgency | null;
  body: Body | null;
  mind: Mind | null;
  note: string;
};

export type WeeklySummary = {
  energyMostFrequent: Energy | null;
  urgencyMostFrequent: Urgency | null;
  mismatchMostCommon: {
    combo: string | null; // "energy+urgency"
    count: number;
  };
  rangeCount: number; // how many sessions included (e.g. 7)
};
