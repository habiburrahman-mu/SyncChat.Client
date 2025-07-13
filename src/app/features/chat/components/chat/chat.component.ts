import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CreateConversationRequest } from '@features/chat/models';
import { ChatSidebarComponent } from "../chat-sidebar/chat-sidebar.component";
import { ConversationService } from '@features/chat/services/conversation.service';
import { AuthService } from '@core/services';
import { ConversationType, MessageType } from '@core/enums';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatStateService, MessageService } from '@features/chat/services';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatTimestampPipe } from '@shared/pipes';

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
    MatTooltipModule,
    ChatSidebarComponent,
    ChatTimestampPipe
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent {
  messagesContainer = viewChild<ElementRef<HTMLDivElement>>('messageContainer');

  messageText = '';

  sendingMessage = signal(false);

  private readonly conversationService = inject(ConversationService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly chatStateService = inject(ChatStateService);

  readonly currentUserId = this.authService.userId;


  readonly selectedConversation = this.chatStateService.selectedConversation;

  readonly isConversationsLoading = this.chatStateService.isConversationsLoading;

  readonly isSelectedConversationMessagesLoading = this.chatStateService.isSelectedConversationMessagesLoading;

  readonly messages = computed(() => this.selectedConversation()?.messages);

  constructor() {
    effect(() => {
      const messageLoading = this.isSelectedConversationMessagesLoading();
      if (!messageLoading) {
        // delay to ensure DOM updated
        setTimeout(() => this.scrollToBottom(), 3000);
      }
    });
  }

  private scrollToBottom(): void {
    const messagesContainer = this.messagesContainer();
    if (messagesContainer) {
      messagesContainer.nativeElement.scrollTop = messagesContainer.nativeElement.scrollHeight;
    }
  }

  sendMessage() {
    if (!this.messageText.trim()) return;

    const conversation = this.selectedConversation();

    if (conversation) {
      if (conversation.id === 0) {
        this.createConversation();
      } else {
        this.messageService.sendMessage({
          conversationId: conversation.id,
          senderId: this.currentUserId!,
          type: MessageType.Text,
          content: this.messageText,
          metaData: undefined,
          replyTo: undefined,
        })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: response => {
              this.chatStateService.addMessageToSelectedConversation({
                messageId: response.messageId,
                uuid: response.uuid,
                conversationId: response.conversationId,
                senderId: response.senderId,
                content: response.content ?? null,
                senderUserName: response.senderUserName,
                senderName: response.senderName,
                updatedAt: response.updatedAt
              });
            },
            error: (err: HttpErrorResponse) => {

            }
          });
      }
    }

    // this.messages.push({ text: this.messageText, fromMe: true });
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
