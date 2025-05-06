import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSidenavModule} from '@angular/material/sidenav';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'chat-chat',
  imports: [CommonModule, MatExpansionModule, MatSidenavModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  readonly panelOpenState = signal(false);

  messages = [
    { text: 'Hello! How can I help you today?', sender: 'bot' },
    { text: 'I have a question about your services.', sender: 'user' },
  ];

  newMessage = '';

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({ text: this.newMessage, sender: 'user' });
      this.newMessage = '';
      setTimeout(() => {
        this.messages.push({ text: 'Thanks for your message!', sender: 'bot' });
      }, 1000);
    }
  }
}
