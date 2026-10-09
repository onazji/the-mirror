import type { KeyValueStore } from "./storage";

export class LocalStorageStore implements KeyValueStore {
  getString(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  setString(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return localStorage.getItem(key) === value;
    } catch {
      return false;
    }
  }
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return localStorage.getItem(key) === null;
    } catch {
      return false;
    }
  }
}
