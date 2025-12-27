import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LogoutRequest, RefreshRequest, RegisterUserRequest, TokenRequest } from '../models';
import { Observable } from 'rxjs';
import { API_ROUTES } from '@core/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthHttpService {

  constructor(private http: HttpClient) { }

  register = (request: RegisterUserRequest): Observable<string> => this.http.post<string>(API_ROUTES.Auth.Register, request);

  login = (request: TokenRequest): Observable<string> =>
    this.http.post<string>(API_ROUTES.Auth.Login, request, {withCredentials: true});

  refresh = (request: RefreshRequest): Observable<string> =>
    this.http.post<string>(API_ROUTES.Auth.RefreshToken, request, { withCredentials: true });

  logout = (request: LogoutRequest): Observable<void> =>
    this.http.post<void>(API_ROUTES.Auth.Logout, request, { withCredentials: true });

  logoutAll = (request: LogoutRequest): Observable<void> =>
    this.http.post<void>(API_ROUTES.Auth.LogoutAll, request, { withCredentials: true });
}
