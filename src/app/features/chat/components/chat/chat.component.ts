import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { NewChatDialogComponent } from '../new-chat-dialog/new-chat-dialog.component';
import { GetUserByUserNameResponse } from '@features/chat/models';

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

  private readonly _dialog = inject(MatDialog);

  users = [  // replace with actual users list from your backend/api
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Charlie' },
    // ...
  ];

  chats = [
    { id: 1, name: 'John Doe', lastMessage: 'Hey, what’s up?' },
    { id: 2, name: 'Alice', lastMessage: 'See you tomorrow!' },
    { id: 3, name: 'Bob', lastMessage: 'Good night.' },
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

  createNewChat() {
    const dialogRef = this._dialog.open(NewChatDialogComponent, {
      width: '400px',
      data: { users: this.users },
    });

    dialogRef.afterClosed().subscribe((selectedUsers: GetUserByUserNameResponse[] | undefined) => {
      if (selectedUsers?.length) {
        // Handle creating a new chat with selected users here
        console.log('Create chat with users:', selectedUsers);
      }
    });
  }

  logout() {

  }
}
