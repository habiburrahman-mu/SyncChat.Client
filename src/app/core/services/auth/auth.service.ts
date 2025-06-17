import { Injectable } from '@angular/core';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { LocalStorageKey } from '@core/enums';
import { DecodedToken } from '@core/models';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private localStorageService: LocalStorageService
  ) { }

  hasValidToken(): boolean {
    const token = this.localStorageService.getItem<string>(LocalStorageKey.Token);

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
    this.localStorageService.clear();
    this.setAuthState(false);
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
