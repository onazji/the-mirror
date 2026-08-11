import type { MirrorCardId } from "./cardEngine";
import type { MirrorLightBehavior } from "../types/lightBehavior";

import emergent from "../assets/mirror/light/emergent.png";
import receptive from "../assets/mirror/light/receptive.png";
import dissonant from "../assets/mirror/light/dissonant.png";
import faithful from "../assets/mirror/light/faithful.png";
import gracious from "../assets/mirror/light/gracious.png";
import wandering from "../assets/mirror/light/wandering.png";
import constricted from "../assets/mirror/light/constricted.png";
import burdened from "../assets/mirror/light/burdened.png";
import fractured from "../assets/mirror/light/fractured.png";

const LIGHT_BEHAVIOR_BY_STATE: Record<MirrorCardId, MirrorLightBehavior> = {
  alignment: "faithful",
  anxiety: "constricted",
  drift: "wandering",
  flow: "gracious",
  idle: "receptive",
  overdrive: "emergent",
  patience: "burdened",
  pressure: "dissonant",
  stagnant: "fractured",
};

const LIGHT_BEHAVIOR_ASSETS: Record<MirrorLightBehavior, string> = {
  emergent,
  receptive,
  dissonant,
  faithful,
  gracious,
  wandering,
  constricted,
  burdened,
  fractured,
};

export function getLightBehaviorAsset(state: MirrorCardId): string {
  return LIGHT_BEHAVIOR_ASSETS[LIGHT_BEHAVIOR_BY_STATE[state]];
}