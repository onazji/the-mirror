import type { Energy, Pace } from "./mirror";

export type EchoAccessLevel = "free" | "premium";

export type EchoActivityMatch = {
  kind: "custom" | "category";
  key: string;
  label: string;
};

export type EchoRecord = {
  id: string;
  earlierSessionId: string;
  laterSessionId: string;
  surfacedAt: number;
  matchedActivity: EchoActivityMatch;
  energy: Energy;
  pace: Pace;
  introductory: boolean;
  viewed: boolean;
};

export type EchoState = {
  version: 1;
  introductoryEchoUsed: boolean;
  records: EchoRecord[];
};
