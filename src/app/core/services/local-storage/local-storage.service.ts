import { Injectable } from '@angular/core';
import { LocalStorageKey } from '@core/enums';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  setItem<T>(key: LocalStorageKey, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem<T>(key: LocalStorageKey): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) as T : null;
  }

  removeItem(key: LocalStorageKey): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }

  hasItem(key: LocalStorageKey): boolean {
    return localStorage.getItem(key) !== null;
  }
}
