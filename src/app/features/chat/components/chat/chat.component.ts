import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'chat-chat',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
   chats = [
    { name: 'John Doe', lastMessage: 'Hey, what’s up?' },
    { name: 'Alice', lastMessage: 'See you tomorrow!' },
    { name: 'Bob', lastMessage: 'Good night.' },
  ];

  selectedChat: any = null;

  messages = [
    { text: 'Hello!', fromMe: false },
    { text: 'Hi, how are you?', fromMe: true },
  ];

  messageText = '';

  selectChat(chat: any) {
    this.selectedChat = chat;
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
