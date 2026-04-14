import { computed, DestroyRef, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService, NotificationService } from '@core/services';
import { ChatNotificationType, MessageType } from '@core/enums';
import { TypingEvent } from '@core/models';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { Conversation, ConversationDTO, ConversationMemberDTO, Message, MessageDTO } from '../models';
import { MessageMapper } from '../utils';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { ChatPanelStateService } from './chat-panel-state.service';
import { ChatTypingIndicatorService } from './chat-typing-indicator.service';

@Injectable({
  providedIn: 'root'
})
export class ConversationStateService {
  private readonly conversations = signal<Conversation[]>([]);
  private readonly conversationsLoading = signal<boolean>(false);
  private readonly selectedConversationId = signal<number | null>(null);
  private readonly messagesLoading = signal<Map<number, boolean>>(new Map());

  private newMessageSubject = new Subject<void>();
  private readonly sortConversationSubject = new BehaviorSubject<number | null>(null);
  private conversationChangeSubject = new Subject<void>();
  private destroySubscriptionSubject = new Subject<void>();

  private readonly currentConversationMemberListUpdate = new Subject<void>();
  readonly currentConversationMemberListUpdate$ = this.currentConversationMemberListUpdate.asObservable();

  readonly conversationMemberList = signal<ConversationMemberDTO[]>([]);
  private readonly notificationAudio = new Audio('assets/audio/notification-tone.mp3');

  removedFromConversation: number | undefined = undefined;
  private readonly _pageSize = 20 as const;

  readonly conversationList = computed(() => this.conversations());
  readonly isConversationsLoading = computed(() => this.conversationsLoading());
  readonly selectedConversation = computed(() => {
    const selectedConversationId = this.selectedConversationId();
    return selectedConversationId
      ? this.conversations().find(c => c.id === selectedConversationId) ?? null
      : null;
  });
  readonly isSelectedConversationMessagesLoading = computed(() => {
    const conversationId = this.selectedConversationId();
    return conversationId ? this.messagesLoading().get(conversationId) ?? false : false;
  });
  readonly isSelectedConversationTyping = computed(() => {
    const conversationId = this.selectedConversationId();
    return conversationId ? this.typingService.isAnyoneTyping() : false;
  });

  readonly newMessage$ = this.newMessageSubject.asObservable();

  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
    private readonly destroyRef: DestroyRef,
    private readonly panelState: ChatPanelStateService,
    private readonly typingService: ChatTypingIndicatorService
  ) {
    this.authService.isAuthenticated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.conversations.set([]);
        this.selectConversation(null);
      });
  }

  onInitialize() {
    if (this.destroySubscriptionSubject.closed) {
      this.destroySubscriptionSubject = new Subject<void>();
    }

    this._subscribeToHasNewMessage();
    this._subscribeToNewConversationCreated();
    this._subscribeToNewMemberAdded();
    this._subscribeToAddedToConversation();
    this._subscribeToRemovedFromConversation();
    this._subscribeToMemberRemoved();
    this._subscribeToMemberRoleChanged();
    this._subscribeToMemberDemoted();
    this._subscribeToSortConversation();
  }

  onDestroy() {
    this.destroySubscriptionSubject.next();
    this.destroySubscriptionSubject.complete();
  }

  private _subscribeToHasNewMessage() {
    this.notificationService.listen<number>(ChatNotificationType.HasNewMessage)
      .pipe(takeUntil(this.destroySubscriptionSubject))
      .subscribe({
        next: (notification) => {
          const conversationId = notification.data;
          const conversation = this.conversations().find(c => c.id === conversationId);

          if (conversationId !== this.selectedConversationId()) {
            this.refreshLastMessage(conversationId);
            this.conversations.update(conversations => {
              const conversation = conversations.find(c => c.id === conversationId);
              if (conversation) {
                conversation.hasUnreadMessages = true;
                conversation.messages.update(messages => {
                  messages = undefined;
                  return messages;
                });
              }
              return conversations;
            });

            this.sortConversationSubject.next(conversationId);
            this.playNotification();

            if (document.hidden) {
              this.notificationService.notify(
                `New message in ${conversation?.name ?? 'SyncChat'}`,
                {
                  body: 'Open SyncChat to read the latest message.',
                  tag: `chat-${conversationId}`,
                  data: { conversationId }
                }
              ).catch(() => null);
            }
          }
        }
      });
  }

  private _subscribeToNewConversationCreated() {
    this.notificationService.listen<ConversationDTO>(ChatNotificationType.NewConversationCreated)
      .pipe(takeUntil(this.destroySubscriptionSubject))
      .subscribe({
        next: (notification) => this._handleNewConversationNotification(notification.data)
      });
  }

  private _subscribeToNewMemberAdded() {
    this.notificationService.listen<number>(ChatNotificationType.NewMemberAdded)
      .pipe(takeUntil(this.destroySubscriptionSubject))
      .subscribe({
        next: (notification) => this._notifyMemberListUpdateIfSelected(notification.data)
      });
  }

  private _subscribeToAddedToConversation() {
    this.notificationService.listen<ConversationDTO>(ChatNotificationType.AddedToConversation)
      .pipe(takeUntil(this.destroySubscriptionSubject))
      .subscribe({
        next: (notification) => this._handleNewConversationNotification(notification.data)
      });
  }

  private _subscribeToRemovedFromConversation() {
    this.notificationService.listen<number>(ChatNotificationType.RemovedFromConversation)
      .pipe(takeUntil(this.destroySubscriptionSubject))
      .subscribe({
        next: (notification) => this._handleRemovedFromConversationNotification(notification.data)
      });
  }

  private _subscribeToMemberRemoved() {
    this.notificationService.listen<number>(ChatNotificationType.MemberRemoved)
      .pipe(takeUntil(this.destroySubscriptionSubject))
      .subscribe({
        next: (notification) => this._notifyMemberListUpdateIfSelected(notification.data)
      });
  }

  private _subscribeToMemberRoleChanged() {
    this.notificationService.listen<number>(ChatNotificationType.MemberRoleChanged)
      .pipe(takeUntil(this.destroySubscriptionSubject))
      .subscribe({
        next: (notification) => this._notifyMemberListUpdateIfSelected(notification.data)
      });
  }

  private _subscribeToMemberDemoted() {
    this.notificationService.listen<number>(ChatNotificationType.MemberDemoted)
      .pipe(takeUntil(this.destroySubscriptionSubject))
      .subscribe({
        next: (notification) => this._notifyMemberListUpdateIfSelected(notification.data)
      });
  }

  private _subscribeToSortConversation() {
    this.sortConversationSubject.asObservable()
      .pipe(takeUntil(this.destroySubscriptionSubject))
      .subscribe({
        next: (conversationId) => {
          if (conversationId !== null) {
            this._sortConversations(conversationId);
          }
        }
      });
  }

  private _notifyMemberListUpdateIfSelected(conversationId: number) {
    if (conversationId === this.selectedConversationId()) {
      this.currentConversationMemberListUpdate.next();
    }
  }

  private _handleNewConversationNotification(newConversation: ConversationDTO) {
    const existing = this.conversations().find(c => c.id === newConversation.conversationId);

    if (!existing) {
      const conversation: Conversation = {
        id: newConversation.conversationId,
        name: newConversation.name,
        lastMessage: newConversation.lastMessage,
        lastMessageMetaData: newConversation.lastMessageMetaData && newConversation.lastMessageMetaData !== '{}' ? JSON.parse(newConversation.lastMessageMetaData) : null,
        lastMessageType: newConversation.lastMessageType,
        conversationType: newConversation.type,
        otherUserId: newConversation.otherUserId,
        members: [],
        messages: signal(undefined),
        hasMoreMessages: true,
        olderMessageLoading: signal(false),
        hasUnreadMessages: true,
        lastSeenMessageId: null,
        avatarUrl: newConversation.avatarUrl
      };

      this.addConversation(conversation);

      if (document.hidden) {
        this.notificationService.notify(
          `Added to ${newConversation.name}`,
          {
            body: 'A new conversation was created for you.',
            tag: `conversation-${newConversation.conversationId}`,
            data: { conversationId: newConversation.conversationId }
          }
        ).catch(() => null);
      }
    } else {
      if (this.removedFromConversation === newConversation.conversationId) {
        this.removedFromConversation = undefined;
      }
    }
  }

  private _handleRemovedFromConversationNotification(conversationId: number) {
    if (conversationId === this.selectedConversationId()) {
      this.currentConversationMemberListUpdate.next();
      this.removedFromConversation = conversationId;
      this._leftConversationNotificationSubscription();
    } else {
      this._removeConversation(conversationId);
    }
  }

  private _removeConversation(conversationId: number) {
    this.conversations.update(conversations => conversations.filter(x => x.id !== conversationId));
  }

  private _sortConversations(conversationId: number): void {
    this.conversations.update(conversations => {
      const index = conversations.findIndex(c => c.id === conversationId);
      if (index <= 0) return conversations;

      const [target] = conversations.splice(index, 1);
      conversations.unshift(target);

      return conversations;
    });
  }

  loadConversations() {
    this.conversationsLoading.set(true);
    this.conversationService.getList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const conversations = response.conversations.map((c) => ({
            id: c.conversationId,
            name: c.name,
            lastMessage: c.lastMessage,
            lastMessageMetaData: c.lastMessageMetaData && c.lastMessageMetaData !== '{}' ? JSON.parse(c.lastMessageMetaData) : null,
            lastMessageType: c.lastMessageType,
            conversationType: c.type,
            otherUserId: c.otherUserId,
            members: [],
            messages: signal(undefined),
            hasMoreMessages: true,
            olderMessageLoading: signal(false),
            hasUnreadMessages: c.haveUnreadMessages,
            lastSeenMessageId: c.lastSeenMessageId,
            avatarUrl: c.avatarUrl
          } as Conversation));
          this.conversations.set(conversations);
        },
        complete: () => this.conversationsLoading.set(false)
      });
  }

  selectConversation(conversationId: number | null) {
    const conversation = this.conversations().find(c => c.id === conversationId);

    this._cleanupPreviousConversation();
    this.selectedConversationId.set(conversationId);

    if (conversationId !== null && conversation) {
      this._listenNotification(conversationId);

      if (!conversation.messages() && this.selectedConversationId() !== 0) {
        this._fetchInitialMessages(conversationId);
      }
    }
  }

  private _cleanupPreviousConversation() {
    this._removeConversationIfUserNoLongerMember();
    this.panelState.chatDetailPanelOpen.set(false);
    this.typingService.clearAll();
    this._leftConversationNotificationSubscription();
    this.conversationChangeSubject = new Subject<void>();
  }

  private _fetchInitialMessages(conversationId: number) {
    this._setMessageLoading(conversationId, true);

    this.messageService.getMessages(conversationId, undefined, this._pageSize)
      .pipe(takeUntil(this.conversationChangeSubject))
      .subscribe({
        next: (response) => {
          const messages = response.messages;

          this.conversations.update(conversations => {
            const conversation = conversations.find(x => x.id === conversationId);

            if (conversation) {
              conversation.messages.set(messages.map(MessageMapper.fromDTO));
              conversation.hasMoreMessages = messages.length === this._pageSize;
              conversation.hasUnreadMessages = false;
            }

            return conversations;
          });
        },
        complete: () => this._setMessageLoading(conversationId, false)
      });
  }

  private _removeConversationIfUserNoLongerMember() {
    if (this.removedFromConversation !== undefined) {
      this._removeConversation(this.removedFromConversation);
      this.removedFromConversation = undefined;
    }
  }

  loadOlderMessages(conversationId: number) {
    const conversation = this.conversations().find(c => c.id === conversationId);

    if (!conversation || !conversation.hasMoreMessages || conversation.olderMessageLoading()) return;

    conversation.olderMessageLoading.set(true);

    const oldestMessageId = conversation.messages()?.[0]?.messageId;

    this.messageService.getMessages(conversationId, oldestMessageId)
      .pipe(takeUntil(this.conversationChangeSubject))
      .subscribe({
        next: (response) => {
          const olderMessages = response.messages.map(MessageMapper.fromDTO);

          this.conversations.update(conversations => {
            const conversation = conversations.find(x => x.id === conversationId);

            if (conversation) {
              conversation.messages.set([...olderMessages, ...(conversation.messages() ?? [])]);
              conversation.hasMoreMessages = olderMessages.length === 20;
            }

            return conversations;
          });
        },
        complete: () => {
          const conversation = this.conversations().find(c => c.id === conversationId);
          if (conversation) conversation.olderMessageLoading.set(false);
        }
      });
  }

  private _listenNotification(conversationId: number) {
    this.notificationService.joinGroup(conversationId.toString())
      .pipe(takeUntil(this.conversationChangeSubject))
      .subscribe();

    this.notificationService.listen<MessageDTO>(ChatNotificationType.MessageReceived)
      .pipe(takeUntil(this.conversationChangeSubject))
      .subscribe({
        next: (chatNotification) => {
          const message = MessageMapper.fromDTO(chatNotification.data);
          this.addMessage(conversationId, message);
          this.sortConversationSubject.next(conversationId);

          if (chatNotification.data.type !== MessageType.System) {
            this.playNotification();
          }

          if (document.hidden) {
            const selectedConversation = this.conversations().find(c => c.id === conversationId);
            this.notificationService.notify(
              `New message in ${selectedConversation?.name ?? 'SyncChat'}`,
              {
                body: message.content ?? 'You received a new message.',
                tag: `chat-${conversationId}`,
                data: { conversationId }
              }
            ).catch(() => null);
          }
        }
      });

    this.notificationService.listen<TypingEvent>(ChatNotificationType.TypingStarted)
      .pipe(takeUntil(this.conversationChangeSubject))
      .subscribe({
        next: (typingNotification) => {
          const { userId } = typingNotification.data;
          this.typingService.userStartedTyping(userId);
        }
      });

    this.notificationService.listen<TypingEvent>(ChatNotificationType.TypingStopped)
      .pipe(takeUntil(this.conversationChangeSubject))
      .subscribe({
        next: (typingNotification) => {
          const { userId } = typingNotification.data;
          this.typingService.userStoppedTyping(userId);
        }
      });
  }

  private _leftConversationNotificationSubscription() {
    const selectedConversationId = this.selectedConversationId();
    if (selectedConversationId && selectedConversationId > 0) {
      this.notificationService.leaveGroup(selectedConversationId.toString());
    }

    this.conversationChangeSubject.next();
    this.conversationChangeSubject.complete();
  }

  addConversation(conversation: Conversation) {
    this.conversations.update(x => [conversation, ...x]);
  }

  removeInvalidChats() {
    if (this.selectedConversationId() === 0) {
      this.selectedConversationId.set(null);
    }

    this.conversations.update(conversations => conversations.filter(x => x.id !== 0));
  }

  addMessageToSelectedConversation(message: Message) {
    const selectedConversationId = this.selectedConversationId();

    if (selectedConversationId && selectedConversationId > 0) {
      this.addMessage(selectedConversationId, message);
      this.sortConversationSubject.next(selectedConversationId);
    }
  }

  addMessage(conversationId: number, message: Message) {
    this.conversations.update(conversations => {
      const conversation = conversations.find(x => x.id === conversationId);

      if (conversation && conversation.messages()) {
        conversation.messages.update(messages => {
          messages!.push(message);
          return messages;
        });

        conversation.lastMessage = message.content;
        conversation.lastMessageMetaData = message.metaData ? message.metaData : null;
        conversation.lastMessageType = message.type;
      }

      return conversations;
    });

    this.newMessageSubject.next();
  }

  private _setMessageLoading(conversationId: number, isLoading: boolean) {
    const updatedMap = new Map(this.messagesLoading());
    updatedMap.set(conversationId, isLoading);
    this.messagesLoading.set(updatedMap);
  }

  updateSelectedConversation(conversation: Conversation) {
    this.selectedConversationId.set(conversation.id);
    this.conversations.update(conversations => {
      const index = conversations.findIndex(c => c.id === conversation.id);
      if (index !== -1) {
        conversations[index] = conversation;
      }
      return conversations;
    });
  }

  updateLastSeenMessageId(messageId: number) {
    const conversationId = this.selectedConversationId();
    if (conversationId) {
      this.conversations.update(conversations => {
        const conversation = conversations.find(c => c.id === this.selectedConversationId());
        if (conversation) {
          conversation.lastSeenMessageId = messageId;
        }
        return conversations;
      });

      this.conversationService.markMessageAsSeen(conversationId, messageId).subscribe();
    }
  }

  refreshLastMessage(conversationId: number) {
    this.conversationService.getLastMessage(conversationId)
      .pipe(takeUntil(this.destroySubscriptionSubject))
      .subscribe({
        next: (response) => {
          this.conversations.update(conversations => {
            const conversation = conversations.find(c => c.id === conversationId);
            if (conversation) {
              conversation.lastMessage = response.content;
              conversation.lastMessageMetaData = response.metaData && response.metaData !== '{}' ? JSON.parse(response.metaData) : null;
              conversation.lastMessageType = response.messageType;
            }
            return conversations;
          });
        }
      });
  }

  playNotification() {
    this.notificationAudio.play().catch(error => {
      console.error('Error playing notification sound:', error);
    });
  }
}
