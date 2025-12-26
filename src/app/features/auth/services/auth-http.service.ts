import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LogoutRequest, RefreshRequest, RegisterUserRequest, TokenRequest, TokenResponse } from '../models';
import { Observable } from 'rxjs';
import { API_ROUTES } from 'app/core/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthHttpService {

  constructor(private http: HttpClient) { }

  register = (request: RegisterUserRequest): Observable<string> => this.http.post<string>(API_ROUTES.Auth.Register, request);

  login = (request: TokenRequest): Observable<TokenResponse> =>
    this.http.post<TokenResponse>(API_ROUTES.Auth.Login, request);

  refresh = (request: RefreshRequest): Observable<string> =>
    this.http.post<string>(API_ROUTES.Auth.RefreshToken, request, { withCredentials: true });

  logout = (request: LogoutRequest): Observable<void> =>
    this.http.post<void>(API_ROUTES.Auth.Logout, request, { withCredentials: true });

  logoutAll = (request: LogoutRequest): Observable<void> =>
    this.http.post<void>(API_ROUTES.Auth.LogoutAll, request, { withCredentials: true });
}
