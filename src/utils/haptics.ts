function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  } catch {
    // fail silently — unsupported browser or permission denied
  }
}

export function lightHaptic(): void {
  vibrate(8);
}

export function mediumHaptic(): void {
  vibrate(30);
}

export function modalHaptic(): void {
  vibrate(12);
}
