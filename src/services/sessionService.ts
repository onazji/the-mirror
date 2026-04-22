import type { KeyValueStore } from "../storage/storage";
import type { MirrorDraft, MirrorSession } from "../types/mirror";

const SESSIONS_KEY = "mirror_sessions_v1";

function safeParseSessions(raw: string | null): MirrorSession[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as MirrorSession[];
  } catch {
    return [];
  }
}

export function loadSessions(store: KeyValueStore): MirrorSession[] {
  return safeParseSessions(store.getString(SESSIONS_KEY));
}

export function saveSessions(store: KeyValueStore, sessions: MirrorSession[]): void {
  store.setString(SESSIONS_KEY, JSON.stringify(sessions));
}

export function createSessionFromDraft(draft: MirrorDraft, timestamp: number): MirrorSession {
  if (!draft.energy || !draft.pace || !draft.body || !draft.mind) {
    throw new Error("Draft incomplete");
  }

  const id = crypto.randomUUID?.() ?? `session-${timestamp}`;

  const note = draft.work.note.trim();

  return {
    id,
    timestamp,
    energy: draft.energy,
    pace: draft.pace,
    body: draft.body,
    mind: draft.mind,
    seer: draft.seer,
    work: {
      ...draft.work,
      note,
    },
    attention: draft.attention,
  };
}

export function appendSession(store: KeyValueStore, session: MirrorSession): MirrorSession[] {
  const sessions = loadSessions(store);
  const next = [...sessions, session];
  saveSessions(store, next);
  return next;
}

export function getLastSession(sessions: MirrorSession[]): MirrorSession | null {
  if (sessions.length === 0) return null;
  return sessions[sessions.length - 1] ?? null;
}