import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConversationDTO, CreateConversationRequest, GetConversationsResponse, GetLastMessageResponse, MarkMessageAsSeenRequest } from '../models';
import { API_ROUTES } from '@core/constants';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {

  constructor(
    private http: HttpClient
  ) { }

  create = (request: CreateConversationRequest) => {
    const url = API_ROUTES.Conversation.Create;
    return this.http.post<number>(url, request);
  }

  getList = () => {
    const url = API_ROUTES.Conversation.GetList;
    return this.http.get<GetConversationsResponse>(url);
  }

  getLastMessage = (conversationId: number) => {
    const url = `${API_ROUTES.Conversation.GetLastMessage}/${conversationId}`;
    return this.http.get<GetLastMessageResponse>(url);
  }

  getDetail = (conversationId: number) => {
    const url = `${API_ROUTES.Conversation.GetDetail}/${conversationId}`;
    return this.http.get<ConversationDTO>(url);
  }

  markMessageAsSeen = (conversationId: number, messageId: number) => {
    const request: MarkMessageAsSeenRequest = {
      conversationId,
      messageId
    };

    const url = `${API_ROUTES.Conversation.MarkMessageAsSeen}`;
    return this.http.put<string>(url, request);
  }
}
