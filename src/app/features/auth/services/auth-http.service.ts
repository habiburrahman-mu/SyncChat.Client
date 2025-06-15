import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterUserRequest, TokenRequest } from '../models';
import { Observable } from 'rxjs';
import { API_ROUTES } from 'app/core/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthHttpService {

  constructor(private http: HttpClient) { }

  register = (request: RegisterUserRequest): Observable<string> => this.http.post<string>(API_ROUTES.Auth.Register, request);

  getToken = (request: TokenRequest): Observable<string> => this.http.get<string>(API_ROUTES.Auth.Token);
}
