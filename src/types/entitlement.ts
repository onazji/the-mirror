export type PremiumAccessLevel = "free" | "premium";

export type BillingObservation =
  | { kind: "active"; checkedAt: number }
  | { kind: "inactive"; checkedAt: number }
  | { kind: "pending"; checkedAt: number }
  | { kind: "unavailable"; checkedAt: number };

export type EntitlementStatus =
  | "active"
  | "inactive"
  | "pending"
  | "unavailable";

export type EntitlementSnapshot = {
  accessLevel: PremiumAccessLevel;
  status: EntitlementStatus;
  source: "play" | "cache" | "none";
  lastVerifiedAt: number | null;
  cacheWriteFailed: boolean;
};
