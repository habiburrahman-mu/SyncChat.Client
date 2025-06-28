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

  hasValidToken(): boolean {
    const token = this._localStorageService.getItem<string>(LocalStorageKey.Token);

    if (!token) return false;

    const decodedToken = this._decodeToken(token);

    if(decodedToken && decodedToken.exp) {
      const expiryTime = decodedToken.exp * 1000; // exp is in seconds
      return expiryTime > Date.now();
    }

    return false;
  }

  setAuthState(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  logout(): void {
    this._localStorageService.clear();
    this.setAuthState(false);
    this._router.navigate([FEATURE_ROUTE_PATH.Auth, AUTH_ROUTE_PATH.Login]);
  }

  private _decodeToken(token: string): DecodedToken | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)) as DecodedToken;
    } catch {
      return null;
    }
  }
}
