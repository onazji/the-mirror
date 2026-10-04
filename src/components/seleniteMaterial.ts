// Laboratory timing. CSS uses relative offsets; scaling this duration scales
// the entire material lifecycle and the independent navigation timers together.
export const SELENITE_DURATION_MS = 2100;
export const SELENITE_SWAP_MS = Math.round(SELENITE_DURATION_MS * 0.62);

// Deterministic, irregularly seeded population carriers, not a moving wipe
// frontier. The subtle shape fields perturb each row's longitudinal profile
// and bundle spacing without introducing per-frame JavaScript or randomness.
export const SELENITE_FIBERS = Array.from({ length: 88 }, (_, index) => ({
  id: index,
  y: (index + 0.5 + Math.sin(index * 7.13) * 0.12) / 88,
  offset: (index * 137.507 + Math.sin(index * 3.7) * 91) % 1000,
  growth: 0.72 + ((index * 37) % 61) / 100,
  phase: index * 1.713 + Math.sin(index * 2.41) * 0.7,
  bend: 0.18 + ((index * 19) % 37) / 100,
  bundle: 0.12 + ((index * 23) % 18) / 100,
}));