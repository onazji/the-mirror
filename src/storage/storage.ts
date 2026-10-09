export interface KeyValueStore {
  getString(key: string): string | null;
  setString(key: string, value: string): boolean;
  remove(key: string): boolean;
}
