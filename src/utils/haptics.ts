const DEBUG_HAPTICS = true;

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
  vibrate(8, "lightHaptic");
}

export function mediumHaptic(): void {
  vibrate(30, "mediumHaptic");
}

export function modalHaptic(): void {
  vibrate(12, "modalHaptic");
}
