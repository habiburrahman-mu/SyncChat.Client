import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, Inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { UserService } from '@features/chat/services';
import { GetUserByUserNameResponse, NewConversation } from '@features/chat/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '@core/services';


@Component({
  selector: 'chat-new-chat-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FormsModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinner
  ],
  templateUrl: './new-chat-dialog.component.html',
  styleUrl: './new-chat-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewChatDialogComponent implements OnInit {
  selectedUsers = signal<GetUserByUserNameResponse[]>([]);
  searchText: string = '';
  groupName: string = '';
  isLoading = signal(false);
  userSearchResponse = signal<GetUserByUserNameResponse | null | undefined>(undefined);
  currentUserId: number = 0;

  isUserSelected = computed(() => {
    console.log("compute")

    const user = this.userSearchResponse();

    if (user) {
      return this.selectedUsers().some(x => x.userID === user.userID);
    }

    return false;
  });

  constructor(
    private dialogRef: MatDialogRef<NewChatDialogComponent, NewConversation>,
    private userService: UserService,
    private destroyRef: DestroyRef,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.currentUserId = this.authService.userId!;
  }

  searchUser() {
    const query = this.searchText.toLowerCase().trim();

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
    if (!this.isUserSelected()) {
      this.selectedUsers.update(users => [...users, user]);
      this.searchText = '';
      this.userSearchResponse.set(undefined);
    }
  }

  removeUser(user: GetUserByUserNameResponse) {
    this.selectedUsers.update(users => users.filter(u => u.userID !== user.userID));
  }

  onCancel() {
    this.dialogRef.close();
  }

  onCreate() {
    const newConversation: NewConversation = {
      selectedUsers: this.selectedUsers(),
      conversationName: this.selectedUsers().length > 1 ? this.groupName : ''
    };

    this.dialogRef.close(newConversation);
  }

  onChangeGroupName() {
    this.groupName = this.groupName.trim();
  }
}
