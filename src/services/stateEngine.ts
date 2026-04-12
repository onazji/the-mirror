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
urgency: "low" | "steady" | "high"
): BaseStateName {
if (energy === "low" && urgency === "low") return "Stagnant";
if (energy === "low" && urgency === "steady") return "Patience";
if (energy === "low" && urgency === "high") return "Anxiety";
if (energy === "steady" && urgency === "low") return "Idle";
if (energy === "steady" && urgency === "steady") return "Alignment";
if (energy === "steady" && urgency === "high") return "Pressure";
if (energy === "high" && urgency === "low") return "Drift";
if (energy === "high" && urgency === "steady") return "Flow";
return "Overdrive";
}
export function classifyState(s: MirrorSession): StateName {
const { urgency, mind, body, energy } = s;
if (urgency === "high" && mind === "scattered" && body === "tense") {
return "Loop State";
}
if (urgency === "high" && mind === "narrow") {
return "Impulse State";
}
if (urgency === "high" && mind === "wide" && body === "relaxed") {
return "Decision Under Pressure";
}
if (
urgency === "steady" &&
mind === "narrow" &&
body === "relaxed" &&
energy === "high"
) {
return "Flow State";
}
if (
urgency === "low" &&
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