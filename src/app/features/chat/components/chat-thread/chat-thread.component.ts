import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UI_CONSTANTS } from '@core/constants';
import { MessageType } from '@core/enums';
import { AuthService } from '@core/services';
import { ConversationService, MessageService, ChatStateService } from '@features/chat/services';
import { ChatTimestampPipe } from '@shared/pipes';
import { Subject, throttleTime } from 'rxjs';
import { ChatTypingIndicatorComponent } from '../chat-typing-indicator/chat-typing-indicator.component';
import { SystemMessageAsyncPipe } from '@features/chat/pipes';

@Component({
  selector: 'chat-chat-thread',
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ChatTimestampPipe,
    ChatTypingIndicatorComponent,
    SystemMessageAsyncPipe
  ],
  templateUrl: './chat-thread.component.html',
  styleUrl: './chat-thread.component.scss'
})
export class ChatThreadComponent implements OnInit {
  messagesContainer = viewChild<ElementRef<HTMLDivElement>>('messagesContainer');

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

  readonly isSelectedConversationTyping = this.chatStateService.isSelectedConversationTyping;

  readonly messages = computed(() => this.selectedConversation()?.messages());

  private scrollPositionBeforeLoadingPreviousMessages = 0;

  private readonly typing$ = new Subject<void>();

  readonly MessageType = MessageType;

  readonly conversationMemberList = this.chatStateService.conversationMemberList;

  constructor() {
    effect(() => {
      const messageLoading = this.isSelectedConversationMessagesLoading();
      const selectedConversation = this.selectedConversation();

      if (!messageLoading || selectedConversation) {
        this.scrollPositionBeforeLoadingPreviousMessages = 0;
        // delay to ensure DOM updated
        setTimeout(() => this.scrollToBottom(false), 0);
      }
    });

    effect(() => {
      if (this.selectedConversation()) {
        const olderMessageLoading = this.selectedConversation()!.olderMessageLoading();

        if (!olderMessageLoading) {
          this.restoreScrollAfterPrepend();
        }
      }
    })
  }

  ngOnInit(): void {
    this.chatStateService.newMessage$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(_ => this.onNewMessage());

    this.typing$
      .pipe(
        throttleTime(UI_CONSTANTS.CHAT.TYPING_INDICATOR_DELAY - UI_CONSTANTS.CHAT.SERVER_ACCEPTABLE_DELAY),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(_ => {
        this.chatStateService.typingIndicator(this.selectedConversation()!.id, true);
      });
  }

  onNewMessage() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.scrollToBottom(true);
      });
    });
  }

  onScrollMessage() {
    const container = this.messagesContainer()?.nativeElement;
    if (container && container.scrollTop < 200) {
      this.scrollPositionBeforeLoadingPreviousMessages = container.scrollHeight;
      this.chatStateService.loadOlderMessages(this.selectedConversation()!.id);
    }
  }

  private restoreScrollAfterPrepend() {
    setTimeout(() => {
      const container = this.messagesContainer()?.nativeElement;

      if (container) {
        const scrollDiff = container.scrollHeight - this.scrollPositionBeforeLoadingPreviousMessages;
        container.scrollTop = scrollDiff;
      }
    });
  }

  private scrollToBottom(smooth: boolean = false): void {
    const messagesContainer = this.messagesContainer();
    if (messagesContainer) {
      const container = messagesContainer.nativeElement;

      if (smooth) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        container.scrollTop = container.scrollHeight;
      }

      this.updateLastSeenMessageId();
    }
  }

  private updateLastSeenMessageId() {
    const lastMessage = this.selectedConversation()!.messages()?.at(-1);
    const lastSeenMessageId = this.selectedConversation()!.lastSeenMessageId;
    if (lastMessage) {
      if (lastSeenMessageId === null || lastSeenMessageId !== lastMessage.messageId) {
        this.chatStateService.updateLastSeenMessageId(lastMessage.messageId);
      }
    }
  }

  onClickViewSidebar() {
    this.chatStateService.toggleChatDetailPanel();
  }


  sendMessage() {
    if (!this.messageText.trim()) return;

    const conversation = this.selectedConversation();

    if (conversation) {
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
            this.chatStateService.typingIndicator(this.selectedConversation()!.id, false);

            this.chatStateService.addMessageToSelectedConversation({
              messageId: response.messageId,
              uuid: response.uuid,
              conversationId: response.conversationId,
              senderId: response.senderId,
              content: response.content ?? null,
              senderUserName: response.senderUserName,
              senderName: response.senderName,
              updatedAt: response.updatedAt,
              metaData: response.metaData ? JSON.parse(response.metaData) : undefined,
              type: response.type
            });
          },
          error: (err: HttpErrorResponse) => {

          }
        });
    }

    this.messageText = '';
  }

  onKeydown() {
    var hasMessage = this.messageText.trim().length > 0;
    if (hasMessage) {
      this.typing$.next();
    } else {
      this.chatStateService.typingIndicator(this.selectedConversation()!.id, false);
    }
  }

}
