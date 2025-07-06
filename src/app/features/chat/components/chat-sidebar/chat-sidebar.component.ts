import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Conversation, NewConversation } from '@features/chat/models';
import { NewChatDialogComponent } from '../new-chat-dialog/new-chat-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/services';
import { ChatStateService, ConversationService } from '@features/chat/services';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'chat-chat-sidebar',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinner
  ],
  templateUrl: './chat-sidebar.component.html',
  styleUrl: './chat-sidebar.component.scss'
})
export class ChatSidebarComponent implements OnInit {
  selectedConversation: Conversation | null = null;

  conversations: Conversation[] = [];

  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly conversationService = inject(ConversationService);
  private readonly chatStateService = inject(ChatStateService);

  readonly conversationList = this.chatStateService.conversationList;
  readonly isConversationsLoading = this.chatStateService.isConversationsLoading;

  // conversations$ = this.conversationService.getList()
  //   .pipe(
  //     map(response => {
  //       return response.conversations.map(c => {
  //         const conversation: Conversation = {
  //           id: c.conversationId,
  //           name: c.name ,
  //           lastMessage: c.lastMessage,
  //           members: []
  //         };

  //         return conversation;
  //       });
  //     })
  //   );

  ngOnInit(): void {
    this.chatStateService.loadConversations();
  }

  createNewChat() {
    this.conversations = this.conversations.filter(x => x.id !== 0);

    if (this.selectedConversation?.id === 0)
      this.selectedConversation = null;

    const dialogRef = this.dialog.open<NewChatDialogComponent, any, NewConversation>(NewChatDialogComponent, {
      width: '400px',
      // data: { users: this.users },
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newConversation: NewConversation | undefined) => {
        if (newConversation !== undefined && newConversation.selectedUsers.length > 0) {
          const conversation: Conversation = {
            id: 0,
            lastMessage: null,
            members: newConversation.selectedUsers.map(x => x.userID),
            name: newConversation.conversationName,
          };

          this.conversations = [conversation, ...this.conversations];
          this.selectChat(conversation);
        }
      });
  }

  selectChat(chat: Conversation) {
    this.selectedConversation = chat;
    this.chatStateService.selectConversation(this.selectedConversation.id);
  }

  logout() {
    this.authService.logout();
  }

}
