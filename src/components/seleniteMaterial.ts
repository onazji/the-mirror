// Laboratory timing. CSS uses relative offsets; scaling this duration scales
// the entire material lifecycle and the independent navigation timers together.
export const SELENITE_DURATION_MS = 2100;
export const SELENITE_SWAP_MS = Math.round(SELENITE_DURATION_MS * 0.62);

// Deterministic, irregularly seeded populations, not a moving wipe frontier.
// No per-frame JavaScript or randomness is required.
export const SELENITE_FIBERS = Array.from({ length: 88 }, (_, index) => ({
  id: index,
  y: (index + 0.5 + Math.sin(index * 7.13) * 0.12) / 88,
  offset: (index * 137.507 + Math.sin(index * 3.7) * 91) % 1000,
  growth: 0.72 + ((index * 37) % 61) / 100,
}));