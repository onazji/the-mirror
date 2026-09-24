import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

const DEBUG_HAPTICS = false;

function browserVibrate(pattern: number | number[], name: string): void {
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

function triggerHaptic(
  style: ImpactStyle,
  browserPattern: number | number[],
  name: string,
): void {
  if (Capacitor.isNativePlatform()) {
    void Haptics.impact({ style }).catch((err) => {
      if (DEBUG_HAPTICS) {
        console.log(`[haptics] ${name} → native haptic failed:`, err);
      }
      browserVibrate(browserPattern, name);
    });
    return;
  }

  browserVibrate(browserPattern, name);
}

export function lightHaptic(): void {
  triggerHaptic(ImpactStyle.Light, [8], "lightHaptic");
}

export function mediumHaptic(): void {
  triggerHaptic(ImpactStyle.Medium, [30], "mediumHaptic");
}

export function modalHaptic(): void {
  triggerHaptic(ImpactStyle.Light, [12], "modalHaptic");
}
