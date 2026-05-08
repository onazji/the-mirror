import type { Energy, Pace } from "../types/mirror";

export function buildResetLine(
  energy: Energy,
  pace: Pace,
  tomorrowStart: string
): string {
  if (energy === "low" && pace === "high") {
    return `Start smaller than you think → ${tomorrowStart}`;
  }

  if (energy === "high" && pace === "low") {
    return `Direct your energy → ${tomorrowStart}`;
  }

  if (energy === "steady" && pace === "steady") {
    return `Stay consistent → ${tomorrowStart}`;
  }

  if (energy === "low") {
    return `Keep it light → ${tomorrowStart}`;
  }

  if (pace === "high") {
    return `Focus the pressure → ${tomorrowStart}`;
  }

  return `Tomorrow starts here → ${tomorrowStart}`;
}