import type { MirrorDraft, MirrorSession } from "../types/mirror";
import { Screen } from "./screens";

export type AppModel = {
  screen: Screen;
  draft: MirrorDraft;
  lastSavedSession: MirrorSession | null;
};

export const createEmptyDraft = (): MirrorDraft => ({
  energy: null,
  pace: null,
  body: null,
  mind: null,

  seer: {
    anchor: false,
    integrity: false,
  },

  work: {
    app: false,
    game: false,
    output: false,
    creative: false,
    physical: false,
    customActivity: "",
    sessions: 1,
    hours: 0,
    minutes: 0,
    note: "",
  },

  attention: "features",

  todaySignal: "",
  blocker: "",
  tomorrowStart: "",
});

export const initialAppModel: AppModel = {
  screen: Screen.HOME,
  draft: createEmptyDraft(),
  lastSavedSession: null,
};