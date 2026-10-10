import type { KeyValueStore } from "../storage/storage";
import type { EchoAccessLevel, EchoActivityMatch, EchoRecord, EchoState } from "../types/echo";
import type { Energy, MirrorSession, Pace } from "../types/mirror";

export const ECHO_STATE_KEY = "mirror_echo_state_v1";
export const MIN_ECHO_SEPARATION_MS = 7 * 24 * 60 * 60 * 1000;
export const ECHO_SURFACE_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

const EMPTY_ECHO_STATE: EchoState = {
  version: 1,
  introductoryEchoUsed: false,
  records: [],
};

const ENERGY_VALUES: readonly Energy[] = ["low", "steady", "high"];
const PACE_VALUES: readonly Pace[] = ["low", "steady", "high"];

export type EchoStateLoadResult = {
  state: EchoState;
  issue: string | null;
  rawSource: string | null;
};

export class EchoStorageError extends Error {
  constructor(
    public readonly code: "corrupt-data" | "write-failed" | "delete-failed",
    message: string
  ) {
    super(message);
    this.name = "EchoStorageError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeActivityName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function activitiesFor(session: MirrorSession): EchoActivityMatch[] {
  const activities: EchoActivityMatch[] = [];
  const customLabel = session.work.customActivity?.trim();

  if (session.work.output && customLabel) {
    activities.push({
      kind: "custom",
      key: `custom:${normalizeActivityName(customLabel)}`,
      label: customLabel,
    });
  }
  if (session.work.app) {
    activities.push({ kind: "category", key: "category:personal", label: "Personal" });
  }
  if (session.work.game) {
    activities.push({ kind: "category", key: "category:professional", label: "Professional" });
  }
  if (session.work.creative) {
    activities.push({ kind: "category", key: "category:creative", label: "Creative" });
  }
  if (session.work.physical) {
    activities.push({ kind: "category", key: "category:physical", label: "Physical" });
  }

  return activities;
}

function bestActivityMatch(
  earlier: MirrorSession,
  later: MirrorSession
): EchoActivityMatch | null {
  const earlierByKey = new Map(activitiesFor(earlier).map((activity) => [activity.key, activity]));
  const matches = activitiesFor(later).filter((activity) => earlierByKey.has(activity.key));

  matches.sort((left, right) => {
    if (left.kind !== right.kind) return left.kind === "custom" ? -1 : 1;
    return left.key.localeCompare(right.key);
  });
  return matches[0] ?? null;
}

function isEnergy(value: unknown): value is Energy {
  return typeof value === "string" && ENERGY_VALUES.includes(value as Energy);
}

function isPace(value: unknown): value is Pace {
  return typeof value === "string" && PACE_VALUES.includes(value as Pace);
}

function normalizeEchoRecord(value: unknown): EchoRecord | null {
  if (!isRecord(value) || !isRecord(value.matchedActivity)) return null;
  const activity = value.matchedActivity;
  if (
    typeof value.id !== "string" ||
    typeof value.earlierSessionId !== "string" ||
    typeof value.laterSessionId !== "string" ||
    typeof value.surfacedAt !== "number" ||
    !Number.isFinite(value.surfacedAt) ||
    (activity.kind !== "custom" && activity.kind !== "category") ||
    typeof activity.key !== "string" ||
    typeof activity.label !== "string" ||
    !isEnergy(value.energy) ||
    !isPace(value.pace) ||
    typeof value.introductory !== "boolean" ||
    typeof value.viewed !== "boolean"
  ) {
    return null;
  }

  return {
    id: value.id,
    earlierSessionId: value.earlierSessionId,
    laterSessionId: value.laterSessionId,
    surfacedAt: value.surfacedAt,
    matchedActivity: {
      kind: activity.kind,
      key: activity.key,
      label: activity.label,
    },
    energy: value.energy,
    pace: value.pace,
    introductory: value.introductory,
    viewed: value.viewed,
  };
}

export function loadEchoStateResult(
  store: KeyValueStore,
  sessions: MirrorSession[]
): EchoStateLoadResult {
  const raw = store.getString(ECHO_STATE_KEY);
  if (!raw) {
    return {
      state: { ...EMPTY_ECHO_STATE, records: [] },
      issue: null,
      rawSource: null,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      state: { ...EMPTY_ECHO_STATE, records: [] },
      issue: "Stored Echo data is not valid JSON.",
      rawSource: raw,
    };
  }

  if (
    !isRecord(parsed) ||
    parsed.version !== 1 ||
    typeof parsed.introductoryEchoUsed !== "boolean" ||
    !Array.isArray(parsed.records)
  ) {
    return {
      state: { ...EMPTY_ECHO_STATE, records: [] },
      issue: "Stored Echo data has an unsupported format.",
      rawSource: raw,
    };
  }

  const normalized = parsed.records.map(normalizeEchoRecord);
  if (normalized.some((record) => record === null)) {
    return {
      state: { ...EMPTY_ECHO_STATE, records: [] },
      issue: "Stored Echo data contains an invalid record.",
      rawSource: raw,
    };
  }

  const sessionIds = new Set(sessions.map((session) => session.id));
  const records = (normalized as EchoRecord[])
    .filter(
      (record) =>
        sessionIds.has(record.earlierSessionId) && sessionIds.has(record.laterSessionId)
    )
    .sort((left, right) => left.surfacedAt - right.surfacedAt || left.id.localeCompare(right.id));

  return {
    state: {
      version: 1,
      introductoryEchoUsed: parsed.introductoryEchoUsed,
      records,
    },
    issue: null,
    rawSource: raw,
  };
}

export function loadEchoState(store: KeyValueStore, sessions: MirrorSession[]): EchoState {
  return loadEchoStateResult(store, sessions).state;
}

function saveEchoState(store: KeyValueStore, state: EchoState): void {
  if (!store.setString(ECHO_STATE_KEY, JSON.stringify(state))) {
    throw new EchoStorageError("write-failed", "The Echo could not be saved on this device.");
  }
}

export function findEchoCandidate(
  newSession: MirrorSession,
  sessions: MirrorSession[],
  state: EchoState
): Omit<EchoRecord, "surfacedAt" | "introductory" | "viewed"> | null {
  const existingPairs = new Set(
    state.records.map((record) => `${record.earlierSessionId}::${record.laterSessionId}`)
  );
  const sessionsById = new Map(sessions.map((session) => [session.id, session]));
  const latestEchoTimestamp = state.records.reduce((latest, record) => {
    const later = sessionsById.get(record.laterSessionId);
    return Math.max(latest, later?.timestamp ?? 0);
  }, 0);

  if (
    latestEchoTimestamp > 0 &&
    newSession.timestamp - latestEchoTimestamp < ECHO_SURFACE_COOLDOWN_MS
  ) {
    return null;
  }

  const candidates = sessions
    .filter(
      (session) =>
        session.id !== newSession.id &&
        newSession.timestamp - session.timestamp >= MIN_ECHO_SEPARATION_MS &&
        session.energy === newSession.energy &&
        session.pace === newSession.pace &&
        !existingPairs.has(`${session.id}::${newSession.id}`)
    )
    .map((earlier) => ({
      earlier,
      activity: bestActivityMatch(earlier, newSession),
      separation: newSession.timestamp - earlier.timestamp,
    }))
    .filter(
      (candidate): candidate is typeof candidate & { activity: EchoActivityMatch } =>
        candidate.activity !== null
    )
    .sort((left, right) => {
      if (left.activity.kind !== right.activity.kind) {
        return left.activity.kind === "custom" ? -1 : 1;
      }
      return (
        right.separation - left.separation ||
        left.earlier.timestamp - right.earlier.timestamp ||
        left.earlier.id.localeCompare(right.earlier.id)
      );
    });

  const best = candidates[0];
  if (!best) return null;

  return {
    id: `echo:${best.earlier.id}:${newSession.id}`,
    earlierSessionId: best.earlier.id,
    laterSessionId: newSession.id,
    matchedActivity: best.activity,
    energy: newSession.energy,
    pace: newSession.pace,
  };
}

export function surfaceEchoForSession(
  store: KeyValueStore,
  newSession: MirrorSession,
  sessions: MirrorSession[],
  accessLevel: EchoAccessLevel,
  surfacedAt = Date.now()
): { state: EchoState; echo: EchoRecord | null } {
  const loaded = loadEchoStateResult(store, sessions);
  if (loaded.issue) {
    throw new EchoStorageError("corrupt-data", `${loaded.issue} Nothing was overwritten.`);
  }
  if (accessLevel === "free" && loaded.state.introductoryEchoUsed) {
    return { state: loaded.state, echo: null };
  }

  const candidate = findEchoCandidate(newSession, sessions, loaded.state);
  if (!candidate) return { state: loaded.state, echo: null };

  const echo: EchoRecord = {
    ...candidate,
    surfacedAt,
    introductory: accessLevel === "free",
    viewed: false,
  };
  const state: EchoState = {
    version: 1,
    introductoryEchoUsed:
      loaded.state.introductoryEchoUsed || echo.introductory,
    records: [...loaded.state.records, echo],
  };
  saveEchoState(store, state);
  return { state, echo };
}

export function markEchoViewed(
  store: KeyValueStore,
  sessions: MirrorSession[],
  echoId: string
): EchoState {
  const loaded = loadEchoStateResult(store, sessions);
  if (loaded.issue) {
    throw new EchoStorageError("corrupt-data", `${loaded.issue} Nothing was overwritten.`);
  }
  const state: EchoState = {
    ...loaded.state,
    records: loaded.state.records.map((record) =>
      record.id === echoId ? { ...record, viewed: true } : record
    ),
  };
  saveEchoState(store, state);
  return state;
}

export function deleteAllEchoes(store: KeyValueStore): void {
  if (!store.remove(ECHO_STATE_KEY)) {
    throw new EchoStorageError("delete-failed", "Echo history could not be deleted from this device.");
  }
}
