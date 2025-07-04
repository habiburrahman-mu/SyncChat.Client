import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Conversation, CreateConversationRequest, GetUserByUserNameResponse } from '@features/chat/models';
import { ChatSidebarComponent } from "../chat-sidebar/chat-sidebar.component";
import { ConversationService } from '@features/chat/services/conversation.service';
import { AuthService } from '@core/services';
import { ConversationType } from '@core/enums';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'chat-chat',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ChatSidebarComponent
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {

  conversation: Conversation | undefined = undefined;
  messageText = '';
  messages: any;

  sendingMessage = signal(false);

  constructor(
    private conversationService: ConversationService,
    private authService: AuthService,
    private destroyRef: DestroyRef
  ) {}

  onSelectConversation(selectedConversation: Conversation) {
    this.conversation = selectedConversation;

    this.messages = [
      { text: 'Hello!', fromMe: false },
      { text: 'Hi, how are you?', fromMe: true },
    ];
  }

  sendMessage() {
    if (!this.messageText.trim()) return;

    if(this.conversation && this.conversation.id === 0) {
      this.createConversation();
    }

    this.messages.push({ text: this.messageText, fromMe: true });
    this.messageText = '';
  }

  private createConversation() {
    const request: CreateConversationRequest = {
      createdBy: this.authService.userId!,
      memberIdList: this.conversation!.members,
      name: this.conversation!.name,
      type: this.conversation!.members.length > 1 ? ConversationType.Group : ConversationType.Direct,
      initialMessage: this.messageText
    };

    this.sendingMessage.set(true);

    this.conversationService.create(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: conversationId => {
          this.conversation!.id = conversationId;
          this.sendingMessage.set(true);
        },
        error: err => {
          this.sendingMessage.set(true);
        }
      });
  }
}
