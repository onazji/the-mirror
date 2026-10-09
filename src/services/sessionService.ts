import type { KeyValueStore } from "../storage/storage";
import type {
  AttentionTag,
  Body,
  Energy,
  Mind,
  MirrorDraft,
  MirrorSession,
  Pace,
  PreviousStartResult,
} from "../types/mirror";

export const SESSIONS_KEY = "mirror_sessions_v1";
export const REFLECTION_EXPORT_FORMAT = "the-mirror-reflections";
export const REFLECTION_EXPORT_VERSION = 1;

type SessionFieldIssue = {
  index: number | null;
  message: string;
};

export type SessionLoadResult = {
  sessions: MirrorSession[];
  issues: SessionFieldIssue[];
  rawSource: string | null;
  migratedCount: number;
};

export type ReflectionExportDocument = {
  format: typeof REFLECTION_EXPORT_FORMAT;
  version: typeof REFLECTION_EXPORT_VERSION;
  exportedAt: string;
  reflectionCount: number;
  reflections: MirrorSession[];
  recovery: {
    warnings: string[];
    rawStoredValue?: string;
  };
};

export class SessionStorageError extends Error {
  constructor(
    public readonly code: "corrupt-data" | "write-failed" | "delete-failed",
    message: string
  ) {
    super(message);
    this.name = "SessionStorageError";
  }
}

const ENERGY_VALUES: readonly Energy[] = ["low", "steady", "high"];
const PACE_VALUES: readonly Pace[] = ["low", "steady", "high"];
const BODY_VALUES: readonly Body[] = ["relaxed", "content", "tense"];
const MIND_VALUES: readonly Mind[] = ["narrow", "wide", "scattered"];
const ATTENTION_VALUES: readonly AttentionTag[] = [
  "waste",
  "bugs",
  "features",
  "brainstorm",
];
const RESULT_VALUES: readonly PreviousStartResult[] = ["yes", "partial", "no"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(value: unknown, values: readonly T[]): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeSessionCount(value: unknown): 1 | 2 | 3 {
  return value === 2 || value === 3 ? value : 1;
}

function normalizeSession(
  value: unknown,
  index: number
): { session: MirrorSession | null; migrated: boolean; issues: SessionFieldIssue[] } {
  const issues: SessionFieldIssue[] = [];
  if (!isRecord(value)) {
    return {
      session: null,
      migrated: false,
      issues: [{ index, message: "Reflection is not an object." }],
    };
  }

  if (typeof value.timestamp !== "number" || !Number.isFinite(value.timestamp)) {
    issues.push({ index, message: "Reflection has no valid timestamp." });
  }
  if (!isOneOf(value.energy, ENERGY_VALUES)) {
    issues.push({ index, message: "Reflection has no valid energy value." });
  }
  if (!isOneOf(value.pace, PACE_VALUES)) {
    issues.push({ index, message: "Reflection has no valid momentum value." });
  }
  if (issues.length > 0) {
    return { session: null, migrated: false, issues };
  }

  const timestamp = value.timestamp as number;
  const seer = isRecord(value.seer) ? value.seer : {};
  const work = isRecord(value.work) ? value.work : {};

  if ("id" in value && (typeof value.id !== "string" || !value.id.trim())) {
    issues.push({ index, message: "Reflection has an invalid ID." });
  }
  if ("body" in value && !isOneOf(value.body, BODY_VALUES)) {
    issues.push({ index, message: "Reflection has an invalid presence value." });
  }
  if ("mind" in value && !isOneOf(value.mind, MIND_VALUES)) {
    issues.push({ index, message: "Reflection has an invalid focus value." });
  }
  if ("seer" in value && !isRecord(value.seer)) {
    issues.push({ index, message: "Reflection has invalid Show Up details." });
  }
  if ("work" in value && !isRecord(value.work)) {
    issues.push({ index, message: "Reflection has invalid Work details." });
  }
  if ("attention" in value && !isOneOf(value.attention, ATTENTION_VALUES)) {
    issues.push({ index, message: "Reflection has an invalid attention value." });
  }
  for (const [field, label] of [
    ["todaySignal", "signal"],
    ["blocker", "friction"],
    ["tomorrowStart", "tomorrow start"],
  ] as const) {
    if (field in value && typeof value[field] !== "string") {
      issues.push({ index, message: `Reflection has invalid ${label} text.` });
    }
  }
  if (
    "previousStartResult" in value &&
    value.previousStartResult !== undefined &&
    !isOneOf(value.previousStartResult, RESULT_VALUES)
  ) {
    issues.push({ index, message: "Reflection has an invalid previous-start result." });
  }
  const previousStartResult = isOneOf(value.previousStartResult, RESULT_VALUES)
    ? value.previousStartResult
    : undefined;

  const session: MirrorSession = {
    id:
      typeof value.id === "string" && value.id.trim()
        ? value.id
        : `legacy-${timestamp}-${index}`,
    timestamp,
    energy: value.energy as Energy,
    pace: value.pace as Pace,
    body: isOneOf(value.body, BODY_VALUES) ? value.body : "relaxed",
    mind: isOneOf(value.mind, MIND_VALUES) ? value.mind : "wide",
    seer: {
      anchor: normalizeBoolean(seer.anchor, false),
      integrity: normalizeBoolean(seer.integrity, false),
    },
    work: {
      app: normalizeBoolean(work.app, false),
      game: normalizeBoolean(work.game, false),
      output: normalizeBoolean(work.output, false),
      creative: normalizeBoolean(work.creative, false),
      physical: normalizeBoolean(work.physical, false),
      customActivity: normalizeString(work.customActivity),
      sessions: normalizeSessionCount(work.sessions),
      hours: normalizeNumber(work.hours, 0),
      minutes: normalizeNumber(work.minutes, 0),
      note: normalizeString(work.note),
    },
    attention: isOneOf(value.attention, ATTENTION_VALUES)
      ? value.attention
      : "features",
    todaySignal: normalizeString(value.todaySignal),
    blocker: normalizeString(value.blocker),
    tomorrowStart: normalizeString(value.tomorrowStart),
    ...(previousStartResult ? { previousStartResult } : {}),
  };

  const migrated =
    value.id !== session.id ||
    value.body !== session.body ||
    value.mind !== session.mind ||
    !isRecord(value.seer) ||
    !isRecord(value.work) ||
    typeof seer.anchor !== "boolean" ||
    typeof seer.integrity !== "boolean" ||
    typeof work.app !== "boolean" ||
    typeof work.game !== "boolean" ||
    typeof work.output !== "boolean" ||
    (work.sessions !== 1 && work.sessions !== 2 && work.sessions !== 3) ||
    typeof work.note !== "string" ||
    value.attention !== session.attention ||
    typeof value.todaySignal !== "string" ||
    typeof value.blocker !== "string" ||
    typeof value.tomorrowStart !== "string";

  return { session, migrated, issues };
}

export function loadSessionsResult(store: KeyValueStore): SessionLoadResult {
  const rawSource = store.getString(SESSIONS_KEY);
  if (!rawSource) {
    return { sessions: [], issues: [], rawSource: null, migratedCount: 0 };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawSource);
  } catch {
    return {
      sessions: [],
      issues: [{ index: null, message: "Stored reflection data is not valid JSON." }],
      rawSource,
      migratedCount: 0,
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      sessions: [],
      issues: [{ index: null, message: "Stored reflection data is not a list." }],
      rawSource,
      migratedCount: 0,
    };
  }

  const sessions: MirrorSession[] = [];
  const issues: SessionFieldIssue[] = [];
  let migratedCount = 0;
  parsed.forEach((value, index) => {
    const normalized = normalizeSession(value, index);
    issues.push(...normalized.issues);
    if (normalized.session) sessions.push(normalized.session);
    if (normalized.migrated) migratedCount += 1;
  });

  return { sessions, issues, rawSource, migratedCount };
}

export function loadSessions(store: KeyValueStore): MirrorSession[] {
  return loadSessionsResult(store).sessions;
}

export function saveSessions(store: KeyValueStore, sessions: MirrorSession[]): void {
  const normalized = sessions.map((session, index) => {
    const result = normalizeSession(session, index);
    if (!result.session || result.issues.length > 0) {
      throw new SessionStorageError(
        "corrupt-data",
        "One or more reflections could not be safely stored."
      );
    }
    return result.session;
  });

  if (!store.setString(SESSIONS_KEY, JSON.stringify(normalized))) {
    throw new SessionStorageError(
      "write-failed",
      "The reflection could not be saved on this device."
    );
  }
}

export function createSessionFromDraft(
  draft: MirrorDraft,
  timestamp: number
): MirrorSession {
  if (!draft.energy || !draft.pace) throw new Error("Draft incomplete");
  if (!draft.tomorrowStart.trim()) throw new Error("Tomorrow start required");

  const id = crypto.randomUUID?.() ?? `session-${timestamp}`;
  return {
    id,
    timestamp,
    energy: draft.energy,
    pace: draft.pace,
    body: draft.body ?? "relaxed",
    mind: draft.mind ?? "wide",
    seer: draft.seer,
    work: { ...draft.work, note: draft.work.note.trim() },
    attention: draft.attention,
    todaySignal: draft.todaySignal.trim(),
    blocker: draft.blocker.trim(),
    tomorrowStart: draft.tomorrowStart.trim(),
    previousStartResult: draft.previousStartResult,
  };
}

function requireCleanSource(store: KeyValueStore): MirrorSession[] {
  const result = loadSessionsResult(store);
  if (result.issues.length > 0) {
    throw new SessionStorageError(
      "corrupt-data",
      "Stored reflection data needs recovery before it can be changed. Export it first."
    );
  }
  return result.sessions;
}

export function appendSession(
  store: KeyValueStore,
  session: MirrorSession
): MirrorSession[] {
  const sessions = requireCleanSource(store);
  const next = [...sessions, session];
  saveSessions(store, next);
  return next;
}

export function deleteSession(store: KeyValueStore, sessionId: string): MirrorSession[] {
  const sessions = requireCleanSource(store);
  const next = sessions.filter((session) => session.id !== sessionId);
  saveSessions(store, next);
  return next;
}

export function deleteAllSessions(store: KeyValueStore): void {
  if (!store.remove(SESSIONS_KEY)) {
    throw new SessionStorageError(
      "delete-failed",
      "Reflection history could not be deleted from this device."
    );
  }
}

export function createReflectionExport(
  store: KeyValueStore,
  exportedAt = new Date()
): ReflectionExportDocument {
  const result = loadSessionsResult(store);
  return {
    format: REFLECTION_EXPORT_FORMAT,
    version: REFLECTION_EXPORT_VERSION,
    exportedAt: exportedAt.toISOString(),
    reflectionCount: result.sessions.length,
    reflections: result.sessions,
    recovery: {
      warnings: result.issues.map((issue) =>
        issue.index === null
          ? issue.message
          : `Reflection ${issue.index + 1}: ${issue.message}`
      ),
      ...(result.issues.length > 0 && result.rawSource !== null
        ? { rawStoredValue: result.rawSource }
        : {}),
    },
  };
}

export function getLastSession(sessions: MirrorSession[]): MirrorSession | null {
  if (sessions.length === 0) return null;
  return sessions[sessions.length - 1] ?? null;
}
