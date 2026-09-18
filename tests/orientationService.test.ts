import { describe, expect, it } from "vitest";
import {
  completeOrientation,
  getFirstRunStage,
  MIRROR_ORIENTATION_KEY,
  MIRROR_ORIENTATION_VERSION,
} from "../src/services/orientationService";

function memoryStore() {
  const values = new Map<string, string>();
  return {
    getString: (key: string) => values.get(key) ?? null,
    setString: (key: string, value: string) => values.set(key, value),
    remove: (key: string) => values.delete(key),
  };
}

describe("first-run Welcome flow", () => {
  it("shows Welcome to a brand-new user", () => {
    expect(getFirstRunStage(memoryStore(), null)).toBe("welcome");
  });

  it("opens avatar selection after Welcome is completed", () => {
    const store = memoryStore();
    completeOrientation(store);
    expect(getFirstRunStage(store, null)).toBe("avatar");
  });

  it("sends a user with an avatar to Home", () => {
    const store = memoryStore();
    completeOrientation(store);
    expect(getFirstRunStage(store, "male")).toBe("home");
  });

  it("bypasses onboarding on refresh after completion", () => {
    const store = memoryStore();
    completeOrientation(store);
    expect(getFirstRunStage(store, "female")).toBe("home");
    expect(getFirstRunStage(store, "female")).toBe("home");
  });

  it("migrates existing avatar users without interrupting them", () => {
    const store = memoryStore();
    expect(getFirstRunStage(store, "male")).toBe("home");
    expect(store.getString(MIRROR_ORIENTATION_KEY)).toBe(
      String(MIRROR_ORIENTATION_VERSION)
    );
  });
});