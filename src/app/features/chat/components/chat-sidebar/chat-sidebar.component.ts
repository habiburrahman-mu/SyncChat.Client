import { CommonModule } from '@angular/common';
import { Component, DestroyRef, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Conversation, GetUserByUserNameResponse } from '@features/chat/models';
import { NewChatDialogComponent } from '../new-chat-dialog/new-chat-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/services';

@Component({
  selector: 'chat-chat-sidebar',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './chat-sidebar.component.html',
  styleUrl: './chat-sidebar.component.scss'
})
export class ChatSidebarComponent {

  onSelectConversation = output<Conversation>();

  selectedConversation: Conversation | null = null;

  conversations: Conversation[] = [];

  constructor(
    private readonly dialog: MatDialog,
    private readonly destroyRef: DestroyRef,
    private readonly authService: AuthService
  ) { }

  createNewChat() {
    this.conversations = this.conversations.filter(x => x.id !== 0);

    if (this.selectedConversation?.id === 0)
      this.selectedConversation = null;

    const dialogRef = this.dialog.open(NewChatDialogComponent, {
      width: '400px',
      // data: { users: this.users },
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((selectedUsers: GetUserByUserNameResponse[] | undefined) => {
        if (selectedUsers !== undefined && selectedUsers.length > 0) {
          const newConversation: Conversation = {
            id: 0,
            lastMessage: null,
            members: selectedUsers.map(x => x.userID),
            name: selectedUsers.map(x => x.name).join(', '),
          };

          this.conversations = [newConversation, ...this.conversations];
          this.selectChat(newConversation);
        }
      });
  }

  selectChat(chat: Conversation) {
    this.selectedConversation = chat;
    this.onSelectConversation.emit(this.selectedConversation);
  }

  logout() {
    this.authService.logout();
  }

}
