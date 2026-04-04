import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, effect, ElementRef, inject, OnInit, signal, untracked, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CHAT_ROUTE_PATH, UI_CONSTANTS } from '@core/constants';
import { MediaOwnerType, MessageType } from '@core/enums';
import { AuthService } from '@core/services';
import { ConversationService, MediaService, MessageService, ChatStateService } from '@features/chat/services';
import { ChatTimestampPipe } from '@shared/pipes';
import { Subject, throttleTime } from 'rxjs';
import { ChatTypingIndicatorComponent } from '../chat-typing-indicator/chat-typing-indicator.component';
import { SystemMessageAsyncPipe } from '@features/chat/pipes';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatMediaInputComponent } from '../chat-media-input/chat-media-input.component';
import { ChatMediaImageComponent } from '../chat-media-image/chat-media-image.component';
import { MediaAttachment } from '@features/chat/models';

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
    SystemMessageAsyncPipe,
    ChatMediaInputComponent,
    ChatMediaImageComponent,
  ],
  templateUrl: './chat-thread.component.html',
  styleUrl: './chat-thread.component.scss'
})
export class ChatThreadComponent implements OnInit {
  messagesContainer = viewChild<ElementRef<HTMLDivElement>>('messagesContainer');
  mediaInput = viewChild<ChatMediaInputComponent>('mediaInput');

  messageText = '';

  sendingMessage = signal(false);

  // Media upload state
  readonly pendingMediaAttachment = signal<MediaAttachment | null>(null);
  readonly isUploadingMedia = signal(false);
  readonly uploadProgress = signal<number | null>(null);
  readonly isThreadDragOver = signal(false);

  private readonly conversationService = inject(ConversationService);
  private readonly messageService = inject(MessageService);
  private readonly mediaService = inject(MediaService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly chatStateService = inject(ChatStateService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly currentUserId = this.authService.userId;


  readonly selectedConversation = this.chatStateService.selectedConversation;

  readonly isConversationsLoading = this.chatStateService.isConversationsLoading;

  readonly isSelectedConversationMessagesLoading = this.chatStateService.isSelectedConversationMessagesLoading;

  readonly isSelectedConversationTyping = this.chatStateService.isSelectedConversationTyping;

  readonly messages = computed(() => this.selectedConversation()?.messages());

  private scrollPositionBeforeLoadingPreviousMessages = 0;

  private readonly typing$ = new Subject<void>();

  readonly MessageType = MessageType;
  readonly CHAT_ROUTE_PATH = CHAT_ROUTE_PATH;

  readonly conversationMemberList = this.chatStateService.conversationMemberList;

  readonly chatListPanelOpen = this.chatStateService.chatListPanelOpen;
  readonly chatListPanelPinned = this.chatStateService.chatListPanelPinned;
  readonly isMobileScreen = this.chatStateService.isMobileScreen;

  constructor() {
    effect(() => {
      const messageLoading = this.isSelectedConversationMessagesLoading();

      if (!messageLoading && untracked(() => this.selectedConversation())) {
        this.scrollPositionBeforeLoadingPreviousMessages = 0;
        // wait two frames so Angular finishes rendering the message list
        requestAnimationFrame(() => {
          requestAnimationFrame(() => this.scrollToBottom(false));
        });
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

  onMediaImageLoaded() {
    const container = this.messagesContainer()?.nativeElement;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 300) {
      this.scrollToBottom(false);
    }
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

  toggleChatPanel() {
    this.chatStateService.toggleChatListPanel();
  }


  sendMessage() {
    const attachment = this.pendingMediaAttachment();

    if (!attachment && !this.messageText.trim()) return;

    const conversation = this.selectedConversation();
    if (!conversation) return;

    if (attachment) {
      this._sendMediaMessage(conversation.id, attachment);
    } else {
      this._sendTextMessage(conversation.id);
    }
  }

  private _sendTextMessage(conversationId: number) {
    const messageBackup = this.messageText;
    this.messageService.sendMessage({
      conversationId,
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
            mediaId: null,
            senderUserName: response.senderUserName,
            senderName: response.senderName,
            updatedAt: response.updatedAt,
            metaData: response.metaData ? JSON.parse(response.metaData) : undefined,
            type: response.type
          });
        },
        error: (_: HttpErrorResponse) => {
          this.messageText = messageBackup;
        }
      });

    this.messageText = '';
  }

  private _sendMediaMessage(conversationId: number, attachment: MediaAttachment) {
    const caption = this.messageText.trim() || undefined;
    this.messageText = '';
    this.isUploadingMedia.set(true);
    this.uploadProgress.set(0);

    this.mediaService.initiateUpload(
      MediaOwnerType.Conversation,
      String(conversationId),
      attachment.file
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ mediaId, uploadUri }) => {
          this.mediaService.uploadToStorage(uploadUri, attachment.file)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (progress) => this.uploadProgress.set(progress),
              complete: () => {
                this.mediaService.confirmUpload(mediaId)
                  .pipe(takeUntilDestroyed(this.destroyRef))
                  .subscribe({
                    next: () => {
                      this.mediaService.pollUntilActive(mediaId)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe({
                          next: () => {
                            this.messageService.sendMediaMessage({
                              conversationId,
                              senderId: this.currentUserId!,
                              type: MessageType.Image,
                              mediaId,
                              caption,
                              replyTo: undefined,
                            })
                              .pipe(takeUntilDestroyed(this.destroyRef))
                              .subscribe({
                                next: (response) => {
                                  this.chatStateService.addMessageToSelectedConversation({
                                    messageId: response.messageId,
                                    uuid: response.uuid,
                                    conversationId: response.conversationId,
                                    senderId: response.senderId,
                                    content: response.content ?? null,
                                    mediaId: response.mediaId,
                                    senderUserName: response.senderUserName,
                                    senderName: response.senderByName,
                                    updatedAt: response.updatedAt,
                                    metaData: response.metaData ? JSON.parse(response.metaData) : undefined,
                                    type: response.type,
                                  });
                                  this._resetMediaState();
                                },
                                error: () => this._resetMediaState(),
                              });
                          },
                          error: () => this._resetMediaState(),
                        });
                    },
                    error: () => this._resetMediaState(),
                  });
              },
              error: () => this._resetMediaState(),
            });
        },
        error: () => this._resetMediaState(),
      });
  }

  private _resetMediaState() {
    this.isUploadingMedia.set(false);
    this.uploadProgress.set(null);
    this.pendingMediaAttachment.set(null);
    this.mediaInput()?.clearAttachment();
  }

  onMediaFileSelected(attachment: MediaAttachment) {
    this.pendingMediaAttachment.set(attachment);
  }

  onAttachmentCleared() {
    this.pendingMediaAttachment.set(null);
  }

  onDragOverThread(event: DragEvent) {
    if (event.dataTransfer?.types.includes('Files')) {
      event.preventDefault();
      this.isThreadDragOver.set(true);
    }
  }

  onDragLeaveThread(event: DragEvent) {
    event.preventDefault();
    this.isThreadDragOver.set(false);
  }

  onDropThread(event: DragEvent) {
    event.preventDefault();
    this.isThreadDragOver.set(false);
    this.mediaInput()?.onDrop(event);
  }

  onKeydown() {
    var hasMessage = this.messageText.trim().length > 0;
    if (hasMessage) {
      this.typing$.next();
    } else {
      this.chatStateService.typingIndicator(this.selectedConversation()!.id, false);
    }
  }

  onBack() {
    this.chatStateService.selectConversation(null);
    this.router.navigate([CHAT_ROUTE_PATH.List], {relativeTo: this.activatedRoute});
  }

}
