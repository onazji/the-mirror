import { describe, expect, it } from "vitest";
import {
  PREMIUM_ENTITLEMENT_KEY,
  loadEntitlementSnapshot,
  reconcileEntitlement,
} from "../src/services/entitlementService";
import type { KeyValueStore } from "../src/storage/storage";

class MemoryStore implements KeyValueStore {
  values = new Map<string, string>();
  failWrites = false;

  getString(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setString(key: string, value: string): boolean {
    if (this.failWrites) return false;
    this.values.set(key, value);
    return true;
  }

  remove(key: string): boolean {
    this.values.delete(key);
    return true;
  }
}

describe("Premium entitlement reconciliation", () => {
  it("starts free when no Play entitlement has been confirmed", () => {
    expect(loadEntitlementSnapshot(new MemoryStore())).toMatchObject({
      accessLevel: "free",
      status: "inactive",
      source: "none",
    });
  });

  it("caches a confirmed active entitlement for offline use", () => {
    const store = new MemoryStore();
    const active = reconcileEntitlement(store, { kind: "active", checkedAt: 100 });
    expect(active).toMatchObject({ accessLevel: "premium", source: "play" });
    expect(loadEntitlementSnapshot(store)).toMatchObject({
      accessLevel: "premium",
      status: "unavailable",
      source: "cache",
      lastVerifiedAt: 100,
    });
  });

  it.each(["unavailable", "pending"] as const)(
    "preserves previously confirmed Premium when Play is %s",
    (kind) => {
      const store = new MemoryStore();
      reconcileEntitlement(store, { kind: "active", checkedAt: 100 });
      expect(reconcileEntitlement(store, { kind, checkedAt: 200 })).toMatchObject({
        accessLevel: "premium",
        status: kind,
        source: "cache",
        lastVerifiedAt: 100,
      });
    }
  );

  it("does not grant a new pending purchase", () => {
    expect(
      reconcileEntitlement(new MemoryStore(), { kind: "pending", checkedAt: 200 })
    ).toMatchObject({ accessLevel: "free", status: "pending", source: "none" });
  });

  it("revokes access only after Play successfully confirms inactivity", () => {
    const store = new MemoryStore();
    reconcileEntitlement(store, { kind: "active", checkedAt: 100 });
    const inactive = reconcileEntitlement(store, { kind: "inactive", checkedAt: 300 });
    expect(inactive).toMatchObject({
      accessLevel: "free",
      status: "inactive",
      source: "play",
      lastVerifiedAt: 300,
    });
    expect(JSON.parse(store.values.get(PREMIUM_ENTITLEMENT_KEY) ?? "{}")).toMatchObject({
      active: false,
      lastVerifiedAt: 300,
    });
  });

  it("reports a cache failure without withholding current confirmed access", () => {
    const store = new MemoryStore();
    store.failWrites = true;
    expect(
      reconcileEntitlement(store, { kind: "active", checkedAt: 100 })
    ).toMatchObject({ accessLevel: "premium", cacheWriteFailed: true });
  });

  it("ignores corrupt cached state", () => {
    const store = new MemoryStore();
    store.values.set(PREMIUM_ENTITLEMENT_KEY, "not-json");
    expect(loadEntitlementSnapshot(store).accessLevel).toBe("free");
  });
});
