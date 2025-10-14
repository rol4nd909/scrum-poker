import { Injectable } from '@angular/core';

/**
 * Thin wrapper around the browser's localStorage to make access injectable
 * and easier to mock in tests. Only implements the methods used by the app.
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageAdapter {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // swallow storage errors (quota, etc.) — caller may choose to surface
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}
