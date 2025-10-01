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
import { ChatStateService, ConversationService, UserService, UserStateService } from '@features/chat/services';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ConversationType } from '@core/enums';
import { catchError, map, of, startWith } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'chat-chat-sidebar',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinner,
    MatMenuModule,
  ],
  templateUrl: './chat-sidebar.component.html',
  styleUrl: './chat-sidebar.component.scss'
})
export class ChatSidebarComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly chatStateService = inject(ChatStateService);
  private readonly userService = inject(UserService);
  private readonly userStateService = inject(UserStateService);
  readonly conversationList = this.chatStateService.conversationList;
  readonly isConversationsLoading = this.chatStateService.isConversationsLoading;
  readonly selectedConversation = this.chatStateService.selectedConversation;

  // userDetailState$ = this.userService.getUserDetail()
  //   .pipe(
  //     map(response => ({ isLoading: false, data: response, error: null })),
  //     startWith({ isLoading: true, data: null, error: null }),
  //     catchError(error => of({ isLoading: false, data: null, error: 'An error occurred while loading user details.' }))
  //   );

  readonly userDetailResource = this.userStateService.userResource;

  ngOnInit(): void {
    this.chatStateService.loadConversations();
    this.userDetailResource.reload();
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

  onClickProfile() {
    const dialogRef = this.dialog.open<ProfileComponent>(ProfileComponent, {
      width: '450px',
    });
  }

  logout() {
    this.authService.logout();
  }

}
