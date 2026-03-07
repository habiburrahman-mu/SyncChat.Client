import { inject, Injectable } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '@core/services';
import { Conversation, Message } from '../models';
import { ChatPanelStateService } from './chat-panel-state.service';
import { ChatTypingIndicatorService } from './chat-typing-indicator.service';
import { ConversationStateService } from './conversation-state.service';

@Injectable({
  providedIn: 'root'
})
export class ChatStateService {
  // Panel state  delegated to ChatPanelStateService
  get chatDetailPanelOpen() { return this.panelState.chatDetailPanelOpen; }
  get chatListPanelOpen() { return this.panelState.chatListPanelOpen; }
  get chatListPanelPinned() { return this.panelState.chatListPanelPinned; }
  get isMobileScreen() { return this.panelState.isMobileScreen; }

  // Conversation state  delegated to ConversationStateService
  get conversationList() { return this.conversationStore.conversationList; }
  get isConversationsLoading() { return this.conversationStore.isConversationsLoading; }
  get selectedConversation() { return this.conversationStore.selectedConversation; }
  get isSelectedConversationMessagesLoading() { return this.conversationStore.isSelectedConversationMessagesLoading; }
  get isSelectedConversationTyping() { return this.conversationStore.isSelectedConversationTyping; }
  get conversationMemberList() { return this.conversationStore.conversationMemberList; }
  get newMessage$() { return this.conversationStore.newMessage$; }
  get currentConversationMemberListUpdate$() { return this.conversationStore.currentConversationMemberListUpdate$; }

  private readonly notificationService = inject(NotificationService);
  private readonly panelState = inject(ChatPanelStateService);
  private readonly typingService = inject(ChatTypingIndicatorService);
  private readonly conversationStore = inject(ConversationStateService);

  private _destroySubject = new Subject<void>();

  isMobile(): boolean { return this.panelState.isMobile(); }

  toggleChatListPanelPinned() { this.panelState.toggleChatListPanelPinned(); }
  toggleChatDetailPanel() { this.panelState.toggleChatDetailPanel(); }
  toggleChatListPanel() { this.panelState.toggleChatListPanel(); }

  loadConversations() { this.conversationStore.loadConversations(); }
  selectConversation(conversationId: number | null) { this.conversationStore.selectConversation(conversationId); }
  addConversation(conversation: Conversation) { this.conversationStore.addConversation(conversation); }
  removeInvalidChats() { this.conversationStore.removeInvalidChats(); }
  addMessage(conversationId: number, message: Message) { this.conversationStore.addMessage(conversationId, message); }
  addMessageToSelectedConversation(message: Message) { this.conversationStore.addMessageToSelectedConversation(message); }
  loadOlderMessages(conversationId: number) { this.conversationStore.loadOlderMessages(conversationId); }
  refreshLastMessage(conversationId: number) { this.conversationStore.refreshLastMessage(conversationId); }
  updateLastSeenMessageId(messageId: number) { this.conversationStore.updateLastSeenMessageId(messageId); }
  updateSelectedConversation(conversation: Conversation) { this.conversationStore.updateSelectedConversation(conversation); }
  playNotification() { this.conversationStore.playNotification(); }

  typingIndicator(conversationId: number, isTyping: boolean) { this.typingService.sendTyping(conversationId, isTyping); }

  onInitialize() {
    if (this._destroySubject.closed) {
      this._destroySubject = new Subject<void>();
    }

    this.notificationService.connect()
      .pipe(takeUntil(this._destroySubject))
      .subscribe();

    this.conversationStore.onInitialize();
  }

  onDestroy() {
    this.conversationStore.onDestroy();

    this._destroySubject.next();
    this._destroySubject.complete();

    this.notificationService.disconnect();
  }
}
