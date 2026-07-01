import type { KeyValueStore } from "../storage/storage";

const CUSTOM_ACTIVITIES_KEY = "mirror_custom_activities_v1";

function safeParseActivities(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function loadCustomActivities(store: KeyValueStore): string[] {
  return safeParseActivities(store.getString(CUSTOM_ACTIVITIES_KEY));
}

export function saveCustomActivity(store: KeyValueStore, activity: string): string[] {
  const trimmed = activity.trim();
  const existing = loadCustomActivities(store);

  if (!trimmed || existing.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
    return existing;
  }

  const next = [...existing, trimmed];
  store.setString(CUSTOM_ACTIVITIES_KEY, JSON.stringify(next));
  return next;
}
