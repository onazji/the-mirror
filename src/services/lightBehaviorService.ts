import type { Body, Mind } from "../types/mirror";
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

const LIGHT_BEHAVIOR_BY_PRESENCE_AND_FOCUS: Record<
  Body,
  Record<Mind, MirrorLightBehavior>
> = {
  relaxed: {
    narrow: "emergent",
    wide: "receptive",
    scattered: "dissonant",
  },
  content: {
    narrow: "faithful",
    wide: "gracious",
    scattered: "wandering",
  },
  tense: {
    narrow: "constricted",
    wide: "burdened",
    scattered: "fractured",
  },
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

export function getLightBehavior(
  presence: Body,
  focus: Mind
): MirrorLightBehavior {
  return LIGHT_BEHAVIOR_BY_PRESENCE_AND_FOCUS[presence][focus];
}

export function getLightBehaviorAsset(
  presence: Body,
  focus: Mind
): string {
  return LIGHT_BEHAVIOR_ASSETS[getLightBehavior(presence, focus)];
}