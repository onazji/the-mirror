import type { KeyValueStore } from "./storage";

export class LocalStorageStore implements KeyValueStore {
  getString(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  setString(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore (storage full / blocked)
    }
  }
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}
