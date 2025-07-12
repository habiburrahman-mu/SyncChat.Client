import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CreateConversationRequest } from '@features/chat/models';
import { ChatSidebarComponent } from "../chat-sidebar/chat-sidebar.component";
import { ConversationService } from '@features/chat/services/conversation.service';
import { AuthService } from '@core/services';
import { ConversationType } from '@core/enums';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatStateService } from '@features/chat/services';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'chat-chat',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ChatSidebarComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  messageText = '';
  messages: any;

  sendingMessage = signal(false);

  private readonly conversationService = inject(ConversationService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly chatStateService = inject(ChatStateService);


  readonly selectedConversation = this.chatStateService.selectedConversation;

  readonly isConversationLoading =this.chatStateService.isConversationsLoading;

  sendMessage() {
    if (!this.messageText.trim()) return;

    const conversation = this.selectedConversation();

    if (conversation && conversation.id === 0) {
      this.createConversation();
    }

    this.messages.push({ text: this.messageText, fromMe: true });
    this.messageText = '';
  }

  private createConversation() {
    const conversation = this.selectedConversation();
    const request: CreateConversationRequest = {
      createdBy: this.authService.userId!,
      memberIdList: [...conversation!.members, this.authService.userId!],
      name: conversation!.name,
      type: conversation!.members.length > 1 ? ConversationType.Group : ConversationType.Direct,
      initialMessage: this.messageText
    };

    this.sendingMessage.set(true);

    this.conversationService.create(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: conversationId => {
          this.selectedConversation()!.id = conversationId;
          this.sendingMessage.set(true);
        },
        error: err => {
          this.sendingMessage.set(true);
        }
      });
  }
}
