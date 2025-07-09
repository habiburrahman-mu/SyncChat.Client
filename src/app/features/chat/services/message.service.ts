import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetMessagesResponse } from '../models';
import { API_ROUTES } from '@core/constants';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private readonly http: HttpClient
  ) { }

  getMessages = (conversationId: number) => {
    const url = API_ROUTES.Message.GetList + '/' + conversationId;
    return this.http.get<GetMessagesResponse>(url);
  }
}
