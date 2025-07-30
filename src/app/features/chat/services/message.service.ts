import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GetMessagesResponse, SendMessageRequest, SendMessageResponse } from '../models';
import { API_ROUTES } from '@core/constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private readonly http: HttpClient
  ) { }

  getMessages = (conversationId: number, lastMessageId?: number, pageSize: number = 20) => {
    const url = API_ROUTES.Message.GetList + '/' + conversationId;

    let params = new HttpParams().set('pageSize', pageSize);

    if (lastMessageId) {
      params = params.set('lastMessageId', lastMessageId);
    }

    return this.http.get<GetMessagesResponse>(url, {params: params});
  }

  sendMessage = (request: SendMessageRequest): Observable<SendMessageResponse> => {
    const url = API_ROUTES.Message.Send;
    return this.http.post<SendMessageResponse>(url, request);
  }
}
