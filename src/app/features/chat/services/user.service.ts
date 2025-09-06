import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetUserByUserNameResponse, GetUserDetailResponse } from '../models';
import { API_ROUTES } from '@core/constants';
import { UpdateUserRequest } from '../models';
import { JsonPatchDocument, JsonPatchForField } from '@core/types';
import { JsonPatchOperation } from '@core/enums';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUserByUserName = (userName: string) => {
    const url = API_ROUTES.User.GetUserByUserName + '/' + userName;
    return this.http.get<GetUserByUserNameResponse>(url);
  }

  getUserDetail = () => {
    const url = API_ROUTES.User.GetDetail;
    return this.http.get<GetUserDetailResponse>(url);
  }

  update = <K extends Extract<keyof UpdateUserRequest, string>>(
    userId: number,
    fieldName: K,
    value: UpdateUserRequest[K]
  ) => {
    const url = API_ROUTES.User.Update + '/' + userId;

    const jsonPatchDoc: JsonPatchForField<UpdateUserRequest, K>[] = [
      {
        op: JsonPatchOperation.Replace,
        path: `/${fieldName}`,
        value
      } as JsonPatchForField<UpdateUserRequest, K>
    ];

    return this.http.patch(url, jsonPatchDoc);
  };
}
