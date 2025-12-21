import { inject, Injectable } from '@angular/core';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { LocalStorageKey } from '@core/enums';
import { DecodedToken } from '@core/models';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { AUTH_ROUTE_PATH, FEATURE_ROUTE_PATH } from '@core/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly _localStorageService = inject(LocalStorageService);
  private readonly _router = inject(Router);

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private _userId: number | null = this.getUserId();

  hasValidToken(): boolean {

    const decodedToken = this._getDecodedToken();

    if (decodedToken && decodedToken.exp) {
      const expiryTime = decodedToken.exp * 1000; // exp is in seconds
      return expiryTime > Date.now();
    }

    return false;
  }

  getAccessToken() {
    return this.hasValidToken() ? this._getTokenString() : null;
  }

  setAuthState(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
    this.updateUserId();
  }

  getDeviceIdentifier(): string  {
    const deviceIdentifier = this._localStorageService.getItem<string>(LocalStorageKey.DeviceIdentifier);

    if(!deviceIdentifier) {
      const newDeviceIdentifier = this.generateDeviceIdentifier();

      this._localStorageService.setItem(LocalStorageKey.DeviceIdentifier, newDeviceIdentifier);

      return newDeviceIdentifier;
    }

    return deviceIdentifier;
  }

  private generateDeviceIdentifier() { return crypto.randomUUID(); }

  updateUserId() {
    this._userId = this.getUserId();
  }

  get userId() {
    return this._userId;
  }

  logout(): void {
    this._localStorageService.clear();
    this.setAuthState(false);
    this._router.navigate([FEATURE_ROUTE_PATH.Auth, AUTH_ROUTE_PATH.Login]);
  }

  private _getDecodedToken(): DecodedToken | null {
    try {
      const token = this._getTokenString();

      if (!token) return null;

      const payload = token.split('.')[1];

      return JSON.parse(atob(payload)) as DecodedToken;
    } catch {
      return null;
    }
  }

  private _getTokenString() {
    return this._localStorageService.getItem<string>(LocalStorageKey.Token);
  }

  private getUserId() {
    if (this.hasValidToken()) {
      const token = this._getDecodedToken()!;

      return +token.sub;
    }

    return null;
  }
}
