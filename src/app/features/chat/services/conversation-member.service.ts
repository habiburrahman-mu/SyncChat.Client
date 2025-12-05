import { Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { AddConversationMemberRequest, ConversationMemberDTO } from '../models';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConversationMemberService {

  constructor(private http: HttpClient) { }

  getList = (conversationId: number) => {
    const url = `${API_ROUTES.ConversationMember.GetList}/${conversationId}`;
    return this.http.get<ConversationMemberDTO[]>(url);
  }

  add = (request: AddConversationMemberRequest) => {
    const url = API_ROUTES.ConversationMember.Add;
    return this.http.post<void>(url, request);
  }

  remove = (conversationMemberId: number) => {
    const url = `${API_ROUTES.ConversationMember.Remove}/${conversationMemberId}`;
    return this.http.delete<void>(url);
  }

  makeAdmin = (conversationMemberId: number) => {
    const url = `${API_ROUTES.ConversationMember.MakeAdmin}/${conversationMemberId}`;
    return this.http.post<void>(url, {});
  }
}
