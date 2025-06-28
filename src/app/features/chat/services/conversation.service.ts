import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateConversationRequest } from '../models';
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
    return this.http.post(url, request);
  }
}
