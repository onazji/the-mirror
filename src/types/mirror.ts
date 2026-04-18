export type Energy = "low" | "steady" | "high";
export type Pace = "low" | "steady" | "high";
export type Body = "relaxed" | "tense";
export type Mind = "narrow" | "wide" | "scattered";

export type MirrorSession = {
  id: string;
  timestamp: number;
  energy: Energy;
  pace: Pace;
  body: Body;
  mind: Mind;
  note?: string;
};

export type MirrorDraft = {
  energy: Energy | null;
  pace: Pace | null;
  body: Body | null;
  mind: Mind | null;
  note: string;
};

export type WeeklySummary = {
  energyMostFrequent: Energy | null;
  paceMostFrequent: Pace | null;
  mismatchMostCommon: {
    combo: string | null; // "energy+pace"
    count: number;
  };
  rangeCount: number; // how many sessions included (e.g. 7)
};
