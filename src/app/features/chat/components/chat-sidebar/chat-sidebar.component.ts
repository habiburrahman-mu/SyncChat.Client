import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Conversation, NewConversation } from '@features/chat/models';
import { NewChatDialogComponent } from '../new-chat-dialog/new-chat-dialog.component';
import { AuthService } from '@core/services';
import { ChatStateService, UserService, UserStateService } from '@features/chat/services';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MessageType } from '@core/enums';
import { MatMenuModule } from '@angular/material/menu';
import { ProfileComponent } from '../profile/profile.component';
import { SystemMessageAsyncPipe } from '@features/chat/pipes';
import { MatTooltip } from "@angular/material/tooltip";
import { Router } from '@angular/router';
import { FEATURE_ROUTE_PATH } from '@core/constants';

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
    SystemMessageAsyncPipe,
    MatTooltip
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
  private readonly router = inject(Router);
  readonly conversationList = this.chatStateService.conversationList;
  readonly isConversationsLoading = this.chatStateService.isConversationsLoading;
  readonly selectedConversation = this.chatStateService.selectedConversation;

  readonly userDetailResource = this.userStateService.userResource;
  readonly MessageType = MessageType;
  readonly chatListPanelPinned = this.chatStateService.chatListPanelPinned;
  readonly isMobileScreen = this.chatStateService.isMobileScreen;

  ngOnInit(): void {
    if (this.chatStateService.conversationList().length === 0) {
      this.chatStateService.loadConversations();
    }
    this.userDetailResource.reload();
  }

  onPinClick() {
    this.chatStateService.toggleChatListPanelPinned();
    if (!this.chatStateService.chatListPanelPinned()) {
      this.chatStateService.toggleChatListPanel();
    }
  }

  createNewChat() {
    this.chatStateService.removeInvalidChats();

    const dialogRef = this.dialog.open<NewChatDialogComponent, any, NewConversation>(NewChatDialogComponent, {
      width: '400px',
    });
  }

  selectChat(conversation: Conversation) {
    this.chatStateService.selectConversation(conversation.id);
    if (!this.chatStateService.chatListPanelPinned()) {
      this.chatStateService.toggleChatListPanel();
    }

    this.router.navigate([FEATURE_ROUTE_PATH.Chat]);
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
