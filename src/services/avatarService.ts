import type { MirrorAvatarVariant } from "../types/avatar";
import type { KeyValueStore } from "../storage/storage";

export const MIRROR_AVATAR_KEY = "mirrorAvatarVariant";

export function loadAvatarVariant(
  store: KeyValueStore
): MirrorAvatarVariant | null {
  const value = store.getString(MIRROR_AVATAR_KEY);
  return value === "male" || value === "female" ? value : null;
}

export function saveAvatarVariant(
  store: KeyValueStore,
  variant: MirrorAvatarVariant
): void {
  store.setString(MIRROR_AVATAR_KEY, variant);
}