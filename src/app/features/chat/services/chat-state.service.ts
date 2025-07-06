import { computed, DestroyRef, Injectable, signal } from '@angular/core';
import { ConversationService } from '.';
import { Conversation } from '../models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  private conversations = signal<Conversation[]>([]);
  private conversationsLoading = signal<boolean>(false);
  private selectedConversationId = signal<number | null>(null);

  readonly conversationList = computed(() => this.conversations());
  readonly isConversationsLoading = computed(() => this.conversationsLoading());
  readonly selectedConversation = computed(() =>
    this.conversations().find(c => c.id === this.selectedConversationId()) ?? null
  );

  constructor(
    private readonly conversationService: ConversationService,
    private readonly destroyRef: DestroyRef
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
            members: [],
            messages: null,
            conversationType: c.type,
            otherUserId: c.otherUserId
          } as Conversation));
          this.conversations.set(conversations);
          this.selectFirstConversation();
        },
        complete: () => this.conversationsLoading.set(false)
      });
  }

  selectConversation(conversationId: number) {
    const conv = this.conversations().find(c => c.id === conversationId);
    if (!conv) return;

    // Set selected conversation
    this.selectedConversationId.set(conversationId);
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
}
