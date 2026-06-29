// Browser Haptics — Platform Support Reality
//
// navigator.vibrate() is the W3C Vibration API. Apple has never implemented
// it on iOS. Every browser on iPhone (Safari, Chrome, Firefox) is required by
// Apple to use the WebKit engine, and WebKit does not expose this API.
//
// What "navigator.vibrate exists: true" actually means on iOS:
//   The function exists as a stub that accepts calls without throwing,
//   but performs no physical vibration. There is no standard web API
//   that triggers haptics on iOS Safari — not even for installed PWAs.
//
// Support reality (as of 2024):
//   ✓ Android Chrome / Android Firefox — fully supported
//   ✗ iOS Safari — not supported (all versions)
//   ✗ iOS Chrome / iOS Firefox — not supported (WebKit restriction)
//   ✗ Desktop browsers — not supported (no vibration hardware)
//
// Decision: keep the implementation as best-effort.
// Android users get tactile feedback. iOS users get nothing silently.
// No error, no degraded experience — the feature simply doesn't fire.

const DEBUG_HAPTICS = false;

function vibrate(pattern: number | number[], name: string): void {
  const supported =
    typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

  if (DEBUG_HAPTICS) {
    console.log(`[haptics] ${name} called | navigator.vibrate exists: ${supported} | pattern: ${JSON.stringify(pattern)}`);
  }

  try {
    if (supported) {
      if (DEBUG_HAPTICS) {
        console.log(`[haptics] ${name} → attempting vibration`);
      }
      navigator.vibrate(pattern);
      if (DEBUG_HAPTICS) {
        console.log(`[haptics] ${name} → vibration call completed`);
      }
    } else {
      if (DEBUG_HAPTICS) {
        console.log(`[haptics] ${name} → skipped (not supported)`);
      }
    }
  } catch (err) {
    if (DEBUG_HAPTICS) {
      console.log(`[haptics] ${name} → caught error:`, err);
    }
  }
}

export function lightHaptic(): void {
  vibrate([8], "lightHaptic");
}

export function mediumHaptic(): void {
  vibrate([30], "mediumHaptic");
}

export function modalHaptic(): void {
  vibrate([12], "modalHaptic");
}
