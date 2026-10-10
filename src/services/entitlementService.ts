import type { KeyValueStore } from "../storage/storage";
import type {
  BillingObservation,
  EntitlementSnapshot,
} from "../types/entitlement";

export const PREMIUM_ENTITLEMENT_KEY = "mirror_premium_entitlement_v1";

type CachedEntitlement = {
  version: 1;
  active: boolean;
  lastVerifiedAt: number;
};

function readCache(store: KeyValueStore): CachedEntitlement | null {
  const raw = store.getString(PREMIUM_ENTITLEMENT_KEY);
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as Partial<CachedEntitlement>;
    if (
      value.version !== 1 ||
      typeof value.active !== "boolean" ||
      typeof value.lastVerifiedAt !== "number" ||
      !Number.isFinite(value.lastVerifiedAt) ||
      value.lastVerifiedAt < 0
    ) {
      return null;
    }
    return value as CachedEntitlement;
  } catch {
    return null;
  }
}

export function loadEntitlementSnapshot(
  store: KeyValueStore
): EntitlementSnapshot {
  const cached = readCache(store);
  if (!cached?.active) {
    return {
      accessLevel: "free",
      status: "inactive",
      source: "none",
      lastVerifiedAt: cached?.lastVerifiedAt ?? null,
      cacheWriteFailed: false,
    };
  }

  return {
    accessLevel: "premium",
    status: "unavailable",
    source: "cache",
    lastVerifiedAt: cached.lastVerifiedAt,
    cacheWriteFailed: false,
  };
}

export function reconcileEntitlement(
  store: KeyValueStore,
  observation: BillingObservation
): EntitlementSnapshot {
  const cached = readCache(store);

  if (observation.kind === "active" || observation.kind === "inactive") {
    const active = observation.kind === "active";
    const cacheWriteFailed = !store.setString(
      PREMIUM_ENTITLEMENT_KEY,
      JSON.stringify({
        version: 1,
        active,
        lastVerifiedAt: observation.checkedAt,
      } satisfies CachedEntitlement)
    );

    return {
      accessLevel: active ? "premium" : "free",
      status: observation.kind,
      source: "play",
      lastVerifiedAt: observation.checkedAt,
      cacheWriteFailed,
    };
  }

  const preservePremium = cached?.active === true;
  return {
    accessLevel: preservePremium ? "premium" : "free",
    status: observation.kind,
    source: preservePremium ? "cache" : "none",
    lastVerifiedAt: cached?.lastVerifiedAt ?? null,
    cacheWriteFailed: false,
  };
}
