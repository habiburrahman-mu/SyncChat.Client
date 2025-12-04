
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, model, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '@core/services';
import { AddConversationMemberRequest, GetUserByUserNameResponse } from '@features/chat/models';
import { ChatStateService, ConversationMemberService, UserService } from '@features/chat/services';

@Component({
  selector: 'chat-add-member-dialog',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinner
],
  templateUrl: './chat-add-member-dialog.component.html',
  styleUrl: './chat-add-member-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatAddMemberDialogComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly chatStateService = inject(ChatStateService);
  private readonly conversationMemberService = inject(ConversationMemberService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef: MatDialogRef<ChatAddMemberDialogComponent, boolean> = inject(MatDialogRef<ChatAddMemberDialogComponent, boolean>);

  selectedUsers = signal<GetUserByUserNameResponse[]>([]);
  currentUserId: number = 0;
  searchText = model<string>('');
  isLoading = signal(false);
  userSearchResponse = signal<GetUserByUserNameResponse | null | undefined>(undefined);

  saveInProgress = signal(false);

  isUserSelected = computed(() => {

    const user = this.userSearchResponse();

    if (user) {
      return this.selectedUsers().some(x => x.userID === user.userID);
    }

    return false;
  });

  selectedConversationMemberIds = this.chatStateService.conversationMemberList;
  selectedConversation = this.chatStateService.selectedConversation;

  selectedUserAlreadyMember = computed(() => {
    return this.selectedConversationMemberIds().some(x => x.userID === this.userSearchResponse()?.userID && x.leftAt === null);
  });

  ngOnInit() {
    this.currentUserId = this.authService.userId!;
  }

  searchUser() {
    const query = this.searchText().toLowerCase().trim();

    if (query.length > 0) {
      this.isLoading.set(true);
      this.userSearchResponse.set(null);

      this.userService.getUserByUserName(query)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: response => {
            this.userSearchResponse.set(response);
            this.isLoading.set(false);
          },
          error: err => {
            this.isLoading.set(false);
          }
        });
    }
  }

  selectUser(user: GetUserByUserNameResponse) {
    if (!this.isUserSelected() && !this.selectedUserAlreadyMember()) {
      this.selectedUsers.update(users => [...users, user]);
      this.searchText.set('');
      this.userSearchResponse.set(undefined);
    }
  }

  removeUser(user: GetUserByUserNameResponse) {
    this.selectedUsers.update(users => users.filter(u => u.userID !== user.userID));
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSave() {
    const selectedUsers = this.selectedUsers();

    if (selectedUsers.length === 0) {
      return;
    }

    const request: AddConversationMemberRequest = {
      conversationId: this.selectedConversation()!.id,
      memberIds: selectedUsers.map(x => x.userID)
    };

    this.saveInProgress.set(true);
    this.conversationMemberService.add(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: () => {
          this.saveInProgress.set(false);
        }
      });
  }
}
