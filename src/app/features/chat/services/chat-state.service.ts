import { DestroyRef, Injectable, signal } from '@angular/core';
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
}
