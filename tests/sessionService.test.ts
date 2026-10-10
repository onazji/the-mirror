import { beforeEach, describe, expect, it } from "vitest";
import {
  appendSession,
  createReflectionExport,
  deleteAllSessions,
  deleteSession,
  loadSessionsResult,
  saveSessions,
  SESSIONS_KEY,
  SessionStorageError,
} from "../src/services/sessionService";
import type { KeyValueStore } from "../src/storage/storage";
import type { MirrorSession } from "../src/types/mirror";

class MemoryStore implements KeyValueStore {
  values = new Map<string, string>();
  failWrites = false;
  failDeletes = false;

  getString(key: string) {
    return this.values.get(key) ?? null;
  }

  setString(key: string, value: string) {
    if (this.failWrites) return false;
    this.values.set(key, value);
    return true;
  }

  remove(key: string) {
    if (this.failDeletes) return false;
    this.values.delete(key);
    return true;
  }
}

const session: MirrorSession = {
  id: "reflection-1",
  timestamp: 1_700_000_000_000,
  energy: "steady",
  pace: "high",
  body: "content",
  mind: "narrow",
  seer: { anchor: true, integrity: false },
  work: {
    app: true,
    game: false,
    output: true,
    creative: true,
    physical: false,
    customActivity: "Planning",
    sessions: 2,
    hours: 1,
    minutes: 30,
    note: "Finished a milestone",
  },
  attention: "features",
  todaySignal: "The smallest step worked",
  blocker: "Too many tabs",
  tomorrowStart: "Open the design notes",
  previousStartResult: "partial",
};

describe("reflection persistence", () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
  });

  it("round-trips every reflection field", () => {
    saveSessions(store, [session]);
    expect(loadSessionsResult(store)).toMatchObject({
      sessions: [session],
      issues: [],
      migratedCount: 0,
    });
  });

  it("reads legacy records with stable defaults without rewriting storage", () => {
    const legacy = {
      timestamp: 123,
      energy: "low",
      pace: "steady",
    };
    const raw = JSON.stringify([legacy]);
    store.values.set(SESSIONS_KEY, raw);

    const result = loadSessionsResult(store);

    expect(result.sessions[0]).toMatchObject({
      id: "legacy-123-0",
      body: "relaxed",
      mind: "wide",
      attention: "features",
      todaySignal: "",
      blocker: "",
      tomorrowStart: "",
    });
    expect(result.migratedCount).toBe(1);
    expect(store.getString(SESSIONS_KEY)).toBe(raw);
  });

  it("reports malformed data and includes the untouched source in export", () => {
    store.values.set(SESSIONS_KEY, "{not-json");

    const result = loadSessionsResult(store);
    const exported = createReflectionExport(store, new Date("2026-10-09T12:00:00Z"));

    expect(result.issues).toHaveLength(1);
    expect(exported.reflections).toEqual([]);
    expect(exported.recovery.rawStoredValue).toBe("{not-json");
    expect(exported.recovery.warnings).toHaveLength(1);
  });

  it("exports the complete stored reflection without omitting optional details", () => {
    saveSessions(store, [session]);

    const exported = createReflectionExport(store, new Date("2026-10-09T12:00:00Z"));

    expect(exported).toMatchObject({
      format: "the-mirror-reflections",
      version: 2,
      exportedAt: "2026-10-09T12:00:00.000Z",
      reflectionCount: 1,
      reflections: [session],
      echoes: {
        version: 1,
        introductoryEchoUsed: false,
        records: [],
      },
      recovery: { warnings: [] },
    });
  });

  it("refuses to overwrite partially invalid stored history", () => {
    const raw = JSON.stringify([session, { id: "broken" }]);
    store.values.set(SESSIONS_KEY, raw);

    expect(() => appendSession(store, { ...session, id: "reflection-2" })).toThrow(
      SessionStorageError
    );
    expect(store.getString(SESSIONS_KEY)).toBe(raw);
  });

  it("reports a failed write without replacing the existing value", () => {
    saveSessions(store, [session]);
    const original = store.getString(SESSIONS_KEY);
    store.failWrites = true;

    expect(() => saveSessions(store, [{ ...session, id: "reflection-2" }])).toThrow(
      /could not be saved/i
    );
    expect(store.getString(SESSIONS_KEY)).toBe(original);
  });

  it("deletes one reflection and then all reflection history", () => {
    saveSessions(store, [session, { ...session, id: "reflection-2" }]);
    const remaining = deleteSession(store, "reflection-1");
    expect(remaining.map((item) => item.id)).toEqual(["reflection-2"]);

    deleteAllSessions(store);
    expect(store.getString(SESSIONS_KEY)).toBeNull();
  });

  it("reports deletion failure and leaves stored history intact", () => {
    saveSessions(store, [session]);
    store.failDeletes = true;

    expect(() => deleteAllSessions(store)).toThrow(/could not be deleted/i);
    expect(loadSessionsResult(store).sessions).toEqual([session]);
  });
});
