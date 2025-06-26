import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetUserByUserNameResponse } from '../models';
import { API_ROUTES } from '@core/constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUserByUserName = (userName: string) => {
    const url = API_ROUTES.User.GetUserByUserName + '/' + userName;
    return this.http.get<GetUserByUserNameResponse>(url);
  }
}
