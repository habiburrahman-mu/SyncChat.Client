import { computed, DestroyRef, Injectable, signal } from '@angular/core';
import { ConversationService, MessageService } from '.';
import { Conversation, Message, MessageDTO } from '../models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '@core/services';
import { ChatNotificationType } from '@core/enums';
import { MessageMapper } from '../utils';
import { Subject, takeUntil } from 'rxjs';

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

  readonly conversationList = computed(() => this.conversations());
  readonly isConversationsLoading = computed(() => this.conversationsLoading());
  readonly selectedConversation = computed(() =>
    this.conversations().find(c => c.id === this.selectedConversationId()) ?? null
  );

  readonly isSelectedConversationMessagesLoading = computed(() => {
    const conversationId = this.selectedConversationId();
    return conversationId ? this.messagesLoading().get(conversationId) ?? false : false;
  });

  newMessage$ = this.newMessageSubject.asObservable();

  private conversationChangeSubject = new Subject<void>();

  private readonly _pageSize = 20 as const;

  constructor(
    private readonly conversationService: ConversationService,
    private readonly destroyRef: DestroyRef,
    private messageService: MessageService,
    private notificationService: NotificationService,
  ) { }

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
            conversationType: c.type,
            otherUserId: c.otherUserId,
            members: [], // TODO
            messages: signal(undefined),
            hasMoreMessages: true,
            olderMessageLoading: signal(false)
          } as Conversation));
          this.conversations.set(conversations);
          this.selectFirstConversation();
        },
        complete: () => this.conversationsLoading.set(false)
      });
  }

  selectConversation(conversationId: number) {
    const conversation = this.conversations().find(c => c.id === conversationId);
    if (!conversation) return;

    this._leftConversationNotificationSubscription();

    this.conversationChangeSubject = new Subject<void>();

    // Set selected conversation
    this.selectedConversationId.set(conversationId);

    this._listenNotification(conversationId);

    if (conversation.messages()) return; // already loaded

    // Mark messages loading
    this.setMessageLoading(conversationId, true);

    // Fetch messages
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
            }

            return conversations;
          });
        },
        complete: () => this.setMessageLoading(conversationId, false)
      });
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
    // TODO
    this.notificationService.joinGroup(conversationId.toString())
      .pipe(takeUntil(this.conversationChangeSubject))
      .subscribe();

    this.notificationService.listen<MessageDTO>(ChatNotificationType.MessageReceived)
      .pipe(takeUntil(this.conversationChangeSubject))
      .subscribe({
        next: (chatNotification) => {
          this.addMessage(conversationId, MessageMapper.fromDTO(chatNotification.data));
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
}
