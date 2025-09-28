import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConversationMemberDTO, CreateConversationRequest, GetConversationsResponse, MarkMessageAsSeenRequest } from '../models';
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
    return this.http.get<string>(url);
  }

  markMessageAsSeen = (conversationId: number, messageId: number) => {
    const request: MarkMessageAsSeenRequest = {
      conversationId,
      messageId
    };

    const url = `${API_ROUTES.Conversation.MarkMessageAsSeen}`;
    return this.http.put<string>(url, request);
  }

  getMembers = (conversationId: number) => {
    const url = `${API_ROUTES.ConversationMember.GetList}/${conversationId}`;
    return this.http.get<ConversationMemberDTO[]>(url);
  }
}
