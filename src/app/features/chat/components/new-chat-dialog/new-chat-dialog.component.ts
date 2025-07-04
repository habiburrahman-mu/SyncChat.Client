import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, Inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
  users: GetUserByUserNameResponse[] = [];
  filteredUsers: GetUserByUserNameResponse[] = [];
  selectedUsers: GetUserByUserNameResponse[] = [];
  searchText: string = '';
  groupName: string = '';
  isLoading = signal(false);
  userSearchResponse: GetUserByUserNameResponse | null | undefined = undefined;

  constructor(
    private dialogRef: MatDialogRef<NewChatDialogComponent, NewConversation>,
    @Inject(MAT_DIALOG_DATA) private data: { users: GetUserByUserNameResponse[] },
    private userService: UserService,
    private destroyRef: DestroyRef,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.users = this.data.users;
    this.filteredUsers = [...this.users];
  }

  searchUser() {
    const query = this.searchText.toLowerCase().trim();

    if (query.length > 0) {
      this.isLoading.set(true);
      this.userSearchResponse = null;

      this.userService.getUserByUserName(query)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: response => {
            this.userSearchResponse = response;
            this.isLoading.set(false);
          },
          error: err => {
            this.isLoading.set(false);
          }
        });
    }
  }

  selectUser(user: GetUserByUserNameResponse) {
    const userAlreadySelected = this.selectedUsers.some(x => x.userID === user.userID);
    if (!userAlreadySelected) {
      this.selectedUsers.push(user);
    }
  }

  removeUser(user: GetUserByUserNameResponse) {
    this.selectedUsers = this.selectedUsers.filter((u) => u.userID !== user.userID);
  }

  onCancel() {
    this.dialogRef.close();
  }

  onCreate() {
    const newConversation: NewConversation = {
      selectedUsers: this.selectedUsers,
      conversationName: this.selectedUsers.length > 1 ? this.groupName : ''
    };

    this.dialogRef.close(newConversation);
  }

  onChangeGroupName() {
    this.groupName = this.groupName.trim();
  }
}
