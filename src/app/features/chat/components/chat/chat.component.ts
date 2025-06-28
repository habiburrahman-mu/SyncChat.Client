import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Conversation, GetUserByUserNameResponse } from '@features/chat/models';
import { ChatSidebarComponent } from "../chat-sidebar/chat-sidebar.component";

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

  onSelectConversation(selectedConversation: Conversation) {
    this.conversation = selectedConversation;

    this.messages = [
      { text: 'Hello!', fromMe: false },
      { text: 'Hi, how are you?', fromMe: true },
    ];
  }

  sendMessage() {
    if (!this.messageText.trim()) return;

    this.messages.push({ text: this.messageText, fromMe: true });
    this.messageText = '';
  }
}
