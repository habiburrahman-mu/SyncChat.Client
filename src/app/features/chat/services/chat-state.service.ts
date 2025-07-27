import { computed, DestroyRef, Injectable, signal } from '@angular/core';
import { ConversationService, MessageService } from '.';
import { Conversation, Message, MessageDTO } from '../models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '@core/services';
import { ChatNotificationType } from '@core/enums';
import { MessageMapper } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  private conversations = signal<Conversation[]>([]);
  private conversationsLoading = signal<boolean>(false);
  private selectedConversationId = signal<number | null>(null);

  // per-conversation message loading state (Map of conversationId → boolean)
  private messagesLoading = signal<Map<number, boolean>>(new Map());

  readonly conversationList = computed(() => this.conversations());
  readonly isConversationsLoading = computed(() => this.conversationsLoading());
  readonly selectedConversation = computed(() =>
    this.conversations().find(c => c.id === this.selectedConversationId()) ?? null
  );

  readonly isSelectedConversationMessagesLoading = computed(() => {
    const conversationId = this.selectedConversationId();
    return conversationId ? this.messagesLoading().get(conversationId) ?? false : false;
  });

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
            messages: undefined,
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

    // Set selected conversation
    this.selectedConversationId.set(conversationId);

    this._listenNotification(conversationId);

    if (conversation.messages) return; // already loaded

    // Mark messages loading
    this.setMessageLoading(conversationId, true);

    // Fetch messages
    this.messageService.getMessages(conversationId).subscribe({
      next: (response) => {
        const messages = response.messages;

        this.conversations.update(conversations => {
          const conversation = conversations.find(x => x.id === conversationId);

          if (conversation) {
            conversation.messages = messages.map(MessageMapper.fromDTO);
          }

          return conversations;
        });
      },
      complete: () => this.setMessageLoading(conversationId, false)
    });
  }

  private _listenNotification(conversationId: number) {
    // TODO
    this.notificationService.joinGroup(conversationId.toString())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.notificationService.listen<MessageDTO>(ChatNotificationType.MessageReceived)
      .pipe(takeUntilDestroyed(this.destroyRef))
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

      if (conversation && conversation.messages) {
        conversation.messages.push(message);
      }

      // conversations.map(c =>
      //   c.id === conversationId
      //     ? {
      //         ...c,
      //         messages: [...(c.messages ?? []), message],
      //         lastMessage: message.text
      //       }
      //     : c
      // )

      return conversations;
    });
  }

  private setMessageLoading(conversationId: number, isLoading: boolean) {
    const updatedMap = new Map(this.messagesLoading());
    updatedMap.set(conversationId, isLoading);
    this.messagesLoading.set(updatedMap);
  }
}
