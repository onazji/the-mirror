import type { MirrorDraft, MirrorSession } from "../types/mirror";
import { Screen } from "./screens";

export type AppModel = {
  screen: Screen;
  draft: MirrorDraft;
  lastSavedSession: MirrorSession | null;
};

export const createEmptyDraft = (): MirrorDraft => ({
  energy: null,
  urgency: null,
  body: null,
  mind: null,
  note: ""
});

export const initialAppModel: AppModel = {
  screen: Screen.HOME,
  draft: createEmptyDraft(),
  lastSavedSession: null
};
