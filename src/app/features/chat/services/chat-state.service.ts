import { computed, DestroyRef, Injectable, signal } from '@angular/core';
import { ConversationMemberService, ConversationService, MessageService } from '.';
import { Conversation, ConversationDTO, ConversationMemberDTO, Message, MessageDTO } from '../models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService, LocalStorageService, NotificationService } from '@core/services';
import { ChatNotificationType, MessageType } from '@core/enums';
import { MessageMapper } from '../utils';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { TypingEvent } from '@core/models';
import { ChatPanelStateService } from './chat-panel-state.service';
import { ChatTypingIndicatorService } from './chat-typing-indicator.service';

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  private conversations = signal<Conversation[]>([]);
  private conversationsLoading = signal<boolean>(false);
  private selectedConversationId = signal<number | null>(null);

  // per-conversation message loading state (Map of conversationId → boolean)
  private messagesLoading = signal<Map<number, boolean>>(new Map());

  private newMessageSubject = new Subject<void>();

  // Panel state — delegated to ChatPanelStateService
  get chatDetailPanelOpen() { return this.panelState.chatDetailPanelOpen; }
  get chatListPanelOpen() { return this.panelState.chatListPanelOpen; }
  get chatListPanelPinned() { return this.panelState.chatListPanelPinned; }
  get isMobileScreen() { return this.panelState.isMobileScreen; }

  readonly conversationList = computed(() => this.conversations());
  readonly isConversationsLoading = computed(() => this.conversationsLoading());
  readonly selectedConversation = computed(() => {
    var selectedConversationId = this.selectedConversationId();
    return selectedConversationId ? this.conversations().find(c => c.id === selectedConversationId) ?? null : null;
  });

  readonly isSelectedConversationMessagesLoading = computed(() => {
    const conversationId = this.selectedConversationId();
    return conversationId ? this.messagesLoading().get(conversationId) ?? false : false;
  });

  readonly isSelectedConversationTyping = computed(() => {
    const conversationId = this.selectedConversationId();
    return conversationId ? this.typingService.isAnyoneTyping() : false;
  });

  newMessage$ = this.newMessageSubject.asObservable();

  readonly sortConversationSubject = new BehaviorSubject<number | null>(null);

  private conversationChangeSubject = new Subject<void>();
  private destroySubscriptionSubject = new Subject<void>();

  private readonly currentConversationMemberListUpdate = new Subject<void>();
  readonly currentConversationMemberListUpdate$ = this.currentConversationMemberListUpdate.asObservable();

  private readonly _pageSize = 20 as const;

  conversationMemberList = signal<ConversationMemberDTO[]>([]);

  readonly notificationAudio = new Audio('assets/audio/notification-tone.mp3');

  // conversationMemberListStore = new Map<number, ConversationMemberDTO[]>();

  removedFromConversation: number | undefined = undefined;

  constructor(
    private readonly conversationService: ConversationService,
    private readonly conversationMemberService: ConversationMemberService,
    private readonly destroyRef: DestroyRef,
    private messageService: MessageService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private localStorageService: LocalStorageService,
    readonly panelState: ChatPanelStateService,
    private readonly typingService: ChatTypingIndicatorService
  ) {
    this.authService.isAuthenticated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isAuthenticated => {
        this.conversations.set([]);
        this.selectConversation(null);
      });
  }

  onInitialize() {
    this.notificationService.connect()
      .pipe(takeUntil(this.destroySubscriptionSubject))
      .subscribe();

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

  private _subscribeToHasNewMessage() {
    this.notificationService.listen<number>(ChatNotificationType.HasNewMessage)
      .pipe(takeUntil(this.destroySubscriptionSubject))
      .subscribe({
        next: (notification) => {
          const conversationId = notification.data;

          if (conversationId !== this.selectedConversationId()) {
            this.refreshLastMessage(conversationId);
            this.conversations.update(conversations => {
              const conversation = conversations.find(c => c.id === conversationId);
              if (conversation) {
                conversation.hasUnreadMessages = true;
                conversation.messages.update(messages => {
                  messages = undefined; // Reset messages to trigger reloading
                  return messages;
                });
              }
              return conversations;
            });

            this.sortConversationSubject.next(conversationId);
            this.playNotification();
          }
        }
      });
  }

  private _subscribeToNewConversationCreated() {
    this.notificationService.listen<ConversationDTO>(ChatNotificationType.NewConversationCreated)
      .pipe(takeUntil(this.destroySubscriptionSubject))
      .subscribe({
        next: (notification) => this.handleNewConversationNotification(notification.data)
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
        next: (notification) => this.handleNewConversationNotification(notification.data)
      });
  }

  private _subscribeToRemovedFromConversation() {
    this.notificationService.listen<number>(ChatNotificationType.RemovedFromConversation)
      .pipe(takeUntil(this.destroySubscriptionSubject))
      .subscribe({
        next: (notification) => this.handleRemovedFromConversationNotification(notification.data)
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
            this.sortConversations(conversationId);
          }
        }
      });
  }

  private _notifyMemberListUpdateIfSelected(conversationId: number) {
    if (conversationId === this.selectedConversationId()) {
      this.currentConversationMemberListUpdate.next();
    }
  }

  isMobile(): boolean {
    return this.panelState.isMobile();
  }

  private handleNewConversationNotification(newConversation: ConversationDTO) {
    const conversation = this.conversations().find(c => c.id === newConversation.conversationId);

    if (!conversation) {
      const conversation: Conversation = {
        id: newConversation.conversationId,
        name: newConversation.name,
        lastMessage: newConversation.lastMessage,
        lastMessageMetaData: newConversation.lastMessageMetaData && newConversation.lastMessageMetaData !== "{}" ? JSON.parse(newConversation.lastMessageMetaData) : null,
        lastMessageType: newConversation.lastMessageType,
        conversationType: newConversation.type,
        otherUserId: newConversation.otherUserId,
        members: [], // TODO
        messages: signal(undefined),
        hasMoreMessages: true,
        olderMessageLoading: signal(false),
        hasUnreadMessages: true,
        lastSeenMessageId: null
      };

      this.addConversation(conversation);
    } else {
      if (this.removedFromConversation === newConversation.conversationId) {
        this.removedFromConversation = undefined;
      }
    }
  }

  private handleRemovedFromConversationNotification(conversationId: number) {
    if (conversationId === this.selectedConversationId()) {
      this.currentConversationMemberListUpdate.next();
      this.removedFromConversation = conversationId;
      this._leftConversationNotificationSubscription();
    } else {
      this.removeConversation(conversationId);
    }
  }

  private removeConversation(conversationId: number) {
    this.conversations.update(conversations => {
      return conversations.filter(x => x.id !== conversationId);
    });
  }

  toggleChatListPanelPinned() { this.panelState.toggleChatListPanelPinned(); }
  toggleChatDetailPanel() { this.panelState.toggleChatDetailPanel(); }
  toggleChatListPanel() { this.panelState.toggleChatListPanel(); }

  private sortConversations(conversationId: number): void {
    this.conversations.update(conversations => {
      const index = conversations.findIndex(c => c.id === conversationId);
      if (index <= 0) return conversations; // Already at top or not found

      const [target] = conversations.splice(index, 1); // Remove from current position
      conversations.unshift(target); // Insert at the front

      return conversations;
    });
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
              conversation.lastMessageMetaData = response.metaData && response.metaData !== "{}" ? JSON.parse(response.metaData) : null;
              conversation.lastMessageType = response.messageType;
            }
            return conversations;
          });
        }
      });
  }

  // getLastMessageFromMetaData(metaData: string | null, members: ConversationMemberDTO[]): string | null {
  //   if (!metaData || metaData === "{}") return null;

  //   const parsedMetaData = JSON.parse(metaData);
  //   return SystemMessageUtil.getSystemMessage(parsedMetaData, members, this.authService.userId!);
  // }

  // getConversationMemberList(conversationId: number) {
  //   const memberListFromStore = this.conversationMemberListStore.get(conversationId);
  //   if (memberListFromStore) {
  //     return of(memberListFromStore);
  //   } else {
  //     return this.conversationMemberService.getList(conversationId).pipe(
  //       takeUntil(this.destroySubscriptionSubject),
  //       tap(members => {
  //         // this.conversationMemberListStore.set(conversationId, members);
  //       })
  //     );
  //   }
  // }

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
            lastMessageMetaData: c.lastMessageMetaData && c.lastMessageMetaData !== "{}" ? JSON.parse(c.lastMessageMetaData) : null,
            lastMessageType: c.lastMessageType,
            conversationType: c.type,
            otherUserId: c.otherUserId,
            members: [], // TODO
            messages: signal(undefined),
            hasMoreMessages: true,
            olderMessageLoading: signal(false),
            hasUnreadMessages: c.haveUnreadMessages,
            lastSeenMessageId: c.lastSeenMessageId
          } as Conversation));
          this.conversations.set(conversations);
          // this.selectFirstConversation();
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
    this.removeConversationIfUserNoLongerMember();
    this.chatDetailPanelOpen.set(false);
    this.typingService.clearAll();
    this._leftConversationNotificationSubscription();
    this.conversationChangeSubject = new Subject<void>();
  }

  private _fetchInitialMessages(conversationId: number) {
    this.setMessageLoading(conversationId, true);

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
        complete: () => this.setMessageLoading(conversationId, false)
      });
  }

  private removeConversationIfUserNoLongerMember() {
    if (this.removedFromConversation !== undefined) {
      this.removeConversation(this.removedFromConversation);
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

  // timeOut: any; // TODO

  private _listenNotification(conversationId: number) {
    // TODO
    this.notificationService.joinGroup(conversationId.toString())
      .pipe(takeUntil(this.conversationChangeSubject))
      .subscribe();

    this.notificationService.listen<MessageDTO>(ChatNotificationType.MessageReceived)
      .pipe(takeUntil(this.conversationChangeSubject))
      .subscribe({
        next: (chatNotification) => {
          this.addMessage(conversationId, MessageMapper.fromDTO(chatNotification.data));
          this.sortConversationSubject.next(conversationId);

          if (chatNotification.data.type !== MessageType.System) {
            this.playNotification();
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

  private selectFirstConversation() {
    if (this.conversations().length > 0) {
      this.selectConversation(this.conversations()[0].id);
    }
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

        // const members = this.conversationMemberListStore.get(conversationId);

        conversation.lastMessage = message.content;
        conversation.lastMessageMetaData = message.metaData ? message.metaData : null;
        conversation.lastMessageType = message.type;
      }

      return conversations;
    });

    this.newMessageSubject.next();
  }

  private setMessageLoading(conversationId: number, isLoading: boolean) {
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
    const conversationId = this.selectedConversationId()
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

  typingIndicator(conversationId: number, isTyping: boolean) {
    this.typingService.sendTyping(conversationId, isTyping);
  }

  // updateConversationMemberStore(conversationId: number, members: ConversationMemberDTO[]) {
  //   this.conversationMemberListStore.set(conversationId, members);
  //   this.updateLastMessage(conversationId);
  // }

  // private updateLastMessage(conversationId: number) {
  //   this.conversations.update(conversations => {
  //     const conversation = conversations.find(c => c.id === conversationId);
  //     if (conversation) {
  //       if (conversation.lastMessageMetaData !== null) {
  //         const memberList = this.conversationMemberListStore.get(conversationId);
  //         if (conversation.lastMessageMetaData && memberList) {
  //           conversation.lastMessage = SystemMessageUtil.getSystemMessage(conversation.lastMessageMetaData, memberList, this.authService.userId!);
  //         }
  //       }
  //     }
  //     return conversations;
  //   });
  // }

  playNotification() {
    this.notificationAudio.play().catch(error => {
      console.error('Error playing notification sound:', error);
    });
  }

  onDestroy() {
    this.destroySubscriptionSubject.next();
    this.destroySubscriptionSubject.complete();

    this.notificationService.disconnect();
  }
}
