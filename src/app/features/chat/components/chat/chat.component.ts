import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'chat-chat',
  imports: [CommonModule, MatExpansionModule, MatSidenavModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  readonly panelOpenState = signal(false);

  users = [
    { id: 1, name: 'Habib', online: true },
    { id: 2, name: 'Alice', online: false },
    { id: 3, name: 'Bob', online: true },
  ];

  selectedUser: any = null;

  messages = [
    { text: 'Hello there!', sender: 'bot' },
  ];

  newMessage = '';

  selectUser(user: any) {
    this.selectedUser = user;
    // You could load different messages here for each user
    this.messages = [
      { text: `Hello ${user.name}! How can I help you?`, sender: 'bot' },
    ];
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedUser) {
      this.messages.push({ text: this.newMessage, sender: 'user' });
      this.newMessage = '';
      setTimeout(() => {
        this.messages.push({ text: 'Got it!', sender: 'bot' });
      }, 1000);
    }
  }
}
