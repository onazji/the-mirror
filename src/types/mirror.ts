import type { SeerCheck } from "./seer";
import type { WorkLog } from "./work";

export type Energy = "low" | "steady" | "high";
export type Pace = "low" | "steady" | "high";
export type Body = "relaxed" | "tense";
export type Mind = "narrow" | "wide" | "scattered";
export type AttentionTag = "waste" | "bugs" | "features" | "brainstorm";

export type MirrorSession = {
  id: string;
  timestamp: number;

  energy: Energy;
  pace: Pace;
  body: Body;
  mind: Mind;

  seer: SeerCheck;
  work: WorkLog;
  attention: AttentionTag;
};

export type MirrorDraft = {
  energy: Energy | null;
  pace: Pace | null;
  body: Body | null;
  mind: Mind | null;

  seer: SeerCheck;
  work: WorkLog;
  attention: AttentionTag;
};

export type WeeklySummary = {
  energy: Energy;
  pace: Pace;
  body: Body;
  mind: Mind;
  count: number;
};