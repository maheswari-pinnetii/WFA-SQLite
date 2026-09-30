/**
 * A safe wrapper around window.localStorage.
 * Falls back to in-memory storage if localStorage is unavailable
 * (e.g., in incognito mode or when cookies/storage are disabled).
 */

class SafeStorage {
  private inMemoryStorage: Record<string, string> = {};

  private isSupported(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  getItem(key: string): string | null {
    if (this.isSupported()) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.warn(`Error reading ${key} from localStorage`, e);
      }
    }
    return this.inMemoryStorage[key] || null;
  }

  setItem(key: string, value: string): void {
    if (this.isSupported()) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch (e) {
        console.warn(`Error writing ${key} to localStorage`, e);
      }
    }
    this.inMemoryStorage[key] = value;
  }

  removeItem(key: string): void {
    if (this.isSupported()) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch (e) {
        console.warn(`Error removing ${key} from localStorage`, e);
      }
    }
    delete this.inMemoryStorage[key];
  }

  clear(): void {
    if (this.isSupported()) {
      try {
        window.localStorage.clear();
        return;
      } catch (e) {
        console.warn(`Error clearing localStorage`, e);
      }
    }
    this.inMemoryStorage = {};
  }
}

export const safeStorage = new SafeStorage();
