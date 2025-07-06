import { computed, DestroyRef, Injectable, signal } from '@angular/core';
import { ConversationService } from '.';
import { Conversation } from '../models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {

  // conversations list state
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
            messages: null
          } as Conversation));
          this.conversations.set(conversations);
        },
        complete: () => this.conversationsLoading.set(false)
      });
  }

  selectConversation(conversationId: number) {
    const conv = this.conversations().find(c => c.id === conversationId);
    if (!conv) return;

    // Set selected conversation
    this.selectedConversationId.set(conversationId);

    // if (conv.messages) return; // already loaded

    // // Mark messages loading
    // this.setMessageLoading(conversationId, true);

    // // Fetch messages
    // this.conversationService.getMessagesByConversationId(conversationId).subscribe({
    //   next: (msgs) => {
    //     this.conversations.update(list =>
    //       list.map(c =>
    //         c.id === conversationId ? { ...c, messages: msgs } : c
    //       )
    //     );
    //   },
    //   complete: () => this.setMessageLoading(conversationId, false)
    // });
  }
}
