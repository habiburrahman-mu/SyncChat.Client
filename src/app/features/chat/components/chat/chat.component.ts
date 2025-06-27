import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { NewChatDialogComponent } from '../new-chat-dialog/new-chat-dialog.component';
import { GetUserByUserNameResponse } from '@features/chat/models';
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
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {

  constructor(
    private dialog: MatDialog,
    private destroyRef: DestroyRef
  ) { }

  chats: Chat[] = [
    { id: 1, name: 'John Doe', lastMessage: "Hey, what's up?" },
    { id: 2, name: 'Alice', lastMessage: 'See you tomorrow!' },
    { id: 3, name: 'Bob', lastMessage: null },
  ];

  selectedChat: Chat | null = null;

  messages = [
    { text: 'Hello!', fromMe: false },
    { text: 'Hi, how are you?', fromMe: true },
  ];

  messageText = '';

  selectChat(chat: Chat) {
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

  createNewChat() {
    this.chats = this.chats.filter(x => x.id !== 0);

    if (this.selectedChat?.id === 0)
      this.selectedChat = null;

    const dialogRef = this.dialog.open(NewChatDialogComponent, {
      width: '400px',
      // data: { users: this.users },
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((selectedUsers: GetUserByUserNameResponse[] | undefined) => {
        if (selectedUsers !== undefined && selectedUsers.length > 0) {
          const newChat: Chat = {
            id: 0,
            lastMessage: null,
            name: selectedUsers.map(x => x.name).join(', ')
          };

          this.chats = [newChat, ...this.chats];
          this.selectedChat = newChat;
        }
      });
  }

  logout() {

  }
}

interface Chat {
  id: number;
  name: string;
  lastMessage: string | null;
}
