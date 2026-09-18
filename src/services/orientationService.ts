import type { MirrorAvatarVariant } from "../types/avatar";
import type { KeyValueStore } from "../storage/storage";

export const MIRROR_ORIENTATION_KEY = "mirrorOrientationVersion";
export const MIRROR_ORIENTATION_VERSION = 1;

export type FirstRunStage = "welcome" | "avatar" | "home";

export function loadOrientationVersion(store: KeyValueStore): number | null {
  const raw = store.getString(MIRROR_ORIENTATION_KEY);
  if (raw === null) return null;

  const version = Number(raw);
  return Number.isFinite(version) ? version : null;
}

export function completeOrientation(store: KeyValueStore): void {
  store.setString(
    MIRROR_ORIENTATION_KEY,
    String(MIRROR_ORIENTATION_VERSION)
  );
}

export function getFirstRunStage(
  store: KeyValueStore,
  avatarVariant: MirrorAvatarVariant | null
): FirstRunStage {
  const orientationVersion = loadOrientationVersion(store);

  if (orientationVersion === MIRROR_ORIENTATION_VERSION) {
    return avatarVariant ? "home" : "avatar";
  }

  // Existing users from before the Welcome flow already chose an avatar.
  // Migrate them silently so the new orientation does not interrupt them.
  if (avatarVariant) {
    completeOrientation(store);
    return "home";
  }

  return "welcome";
}