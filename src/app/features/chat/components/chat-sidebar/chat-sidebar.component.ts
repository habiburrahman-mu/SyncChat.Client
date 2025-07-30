import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, output, signal } from '@angular/core';
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
import { ConversationType } from '@core/enums';

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
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly chatStateService = inject(ChatStateService);

  readonly conversationList = this.chatStateService.conversationList;
  readonly isConversationsLoading = this.chatStateService.isConversationsLoading;
  readonly selectedConversation = this.chatStateService.selectedConversation;

  ngOnInit(): void {
    this.chatStateService.loadConversations();
  }

  createNewChat() {
    this.chatStateService.removeInvalidChats();

    const dialogRef = this.dialog.open<NewChatDialogComponent, any, NewConversation>(NewChatDialogComponent, {
      width: '400px',
      // data: { users: this.users },
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newConversation: NewConversation | undefined) => {
        if (newConversation !== undefined && newConversation.selectedUsers.length > 0) {
          const isDirect = newConversation.conversationType === ConversationType.Direct;

          const conversation: Conversation = {
            id: 0,
            lastMessage: null,
            members: newConversation.selectedUsers.map(x => x.userID),
            name: newConversation.conversationName,
            conversationType: newConversation.conversationType,
            otherUserId: isDirect ? newConversation.selectedUsers[0].userID : null,
            hasMoreMessages: false,
            olderMessageLoading: signal(false),
            messages: signal(undefined)
          };

          const conversationList = this.conversationList();

          if (newConversation.conversationType === ConversationType.Direct) {
            const otherUserId = newConversation.selectedUsers.find(x => x.userID !== this.authService.userId!)!.userID;
            const conversationExist = conversationList.find(x => x.otherUserId === otherUserId);
            if (conversationExist) {
              this.selectChat(conversationExist);
              return;
            }
          }

          this.chatStateService.addConversation(conversation);
          this.selectChat(conversation);
        }
      });
  }

  selectChat(conversation: Conversation) {
    this.chatStateService.selectConversation(conversation.id);
  }

  logout() {
    this.authService.logout();
  }

}
