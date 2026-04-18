import type { MirrorSession } from "../types/mirror";
export type BaseStateName =
| "Stagnant"
| "Patience"
| "Anxiety"
| "Idle"
| "Alignment"
| "Pressure"
| "Drift"
| "Flow"
| "Overdrive";
export type StateName =
| "Loop State"
| "Impulse State"
| "Decision Under Pressure"
| "Flow State"
| "Recovery State"
| "Undefined";
export function getBaseState(
energy: "low" | "steady" | "high",
pace: "low" | "steady" | "high"
): BaseStateName {
if (energy === "low" && pace === "low") return "Stagnant";
if (energy === "low" && pace === "steady") return "Patience";
if (energy === "low" && pace === "high") return "Anxiety";
if (energy === "steady" && pace === "low") return "Idle";
if (energy === "steady" && pace === "steady") return "Alignment";
if (energy === "steady" && pace === "high") return "Pressure";
if (energy === "high" && pace === "low") return "Drift";
if (energy === "high" && pace === "steady") return "Flow";
return "Overdrive";
}
export function classifyState(s: MirrorSession): StateName {
const { pace, mind, body, energy } = s;
if (pace === "high" && mind === "scattered" && body === "tense") {
return "Loop State";
}
if (pace === "high" && mind === "narrow") {
return "Impulse State";
}
if (pace === "high" && mind === "wide" && body === "relaxed") {
return "Decision Under Pressure";
}
if (
pace === "steady" &&
mind === "narrow" &&
body === "relaxed" &&
energy === "high"
) {
return "Flow State";
}
if (
pace === "low" &&
mind === "wide" &&
body === "relaxed" &&
energy === "low"
) {
return "Recovery State";
}
return "Undefined";
}
export function getStateReflection(state: StateName): string | null {
switch (state) {
case "Loop State":
return "Your system is overloaded and cycling.";
case "Impulse State":
return "Your focus is locked onto one outcome.";
case "Decision Under Pressure":
return "Pressure is high, but your awareness is open.";
case "Flow State":
return "You are aligned for focused action.";
case "Recovery State":
return "Your system is in restoration mode.";
default:
return null;
}
}
export function getStateInstruction(state: StateName): string | null {
switch (state) {
case "Loop State":
return "Pause and regulate.";
case "Impulse State":
return "Interrupt and expand your focus.";
case "Decision Under Pressure":
return "Choose your direction.";
case "Flow State":
return "Continue.";
case "Recovery State":
return "Rest.";
default:
return null;
}
}