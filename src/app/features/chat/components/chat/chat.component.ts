import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'chat-chat',
  imports: [
    CommonModule,
    MatExpansionModule,
    MatSidenavModule,
    FormsModule,
    MatIconModule,
    LottieComponent,
    MatSidenavModule,
    MatListModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  // Mock chat list for display
  chatList = [
    { name: 'John Doe', lastMessage: 'Hey, how are you?' },
    { name: 'Jane Smith', lastMessage: 'Let’s catch up soon!' },
    // Add more chats as needed
  ];

  // Selected chat and its messages
  selectedChat: any;
  messages = [
    { text: 'Hello!', isOwn: true, time: '10:30 AM' },
    { text: 'Hi there!', isOwn: false, time: '10:31 AM' },
    // Add more messages as needed
  ];

  newMessage: string = '';

  // Method to create a new chat
  newChat() {
    // Open a new chat or show chat creation functionality
  }

  // Method to select a chat
  selectChat(chat: any) {
    this.selectedChat = chat;
    this.messages = [
      { text: 'Hello!', isOwn: true, time: '10:30 AM' },
      { text: 'Hi there!', isOwn: false, time: '10:31 AM' },
      // Fetch or simulate messages for the selected chat
    ];
  }

  // Send a new message
  sendMessage() {
    if (this.newMessage.trim()) {
      const message = {
        text: this.newMessage,
        isOwn: true,
        time: new Date().toLocaleTimeString(),
      };
      this.messages.push(message);
      this.newMessage = ''; // Clear input field
    }
  }
}

export interface Message {
  text: string;
  isOwn: boolean;
  time: string;
}
