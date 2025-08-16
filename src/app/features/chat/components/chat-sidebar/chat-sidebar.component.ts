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
    });
  }

  selectChat(conversation: Conversation) {
    this.chatStateService.selectConversation(conversation.id);
  }

  logout() {
    this.authService.logout();
  }

}
