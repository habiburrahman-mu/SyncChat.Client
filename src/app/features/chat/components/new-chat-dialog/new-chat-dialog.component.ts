
import { ChangeDetectionStrategy, Component, computed, DestroyRef, HostListener, inject, Inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ChatStateService, ConversationService, UserService } from '@features/chat/services';
import { Conversation, CreateConversationRequest, GetUserByUserNameResponse, NewConversation } from '@features/chat/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '@core/services';
import { ConversationType } from '@core/enums';


@Component({
  selector: 'chat-new-chat-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
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
  saveInProgress = signal(false);

  isUserSelected = computed(() => {

    const user = this.userSearchResponse();

    if (user) {
      return this.selectedUsers().some(x => x.userID === user.userID);
    }

    return false;
  });

  private readonly dialogRef = inject(MatDialogRef<NewChatDialogComponent, NewConversation>);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);
  private readonly conversationService = inject(ConversationService);
  private readonly chatStateService = inject(ChatStateService);

  readonly conversationList = this.chatStateService.conversationList;

  ngOnInit() {
    this.currentUserId = this.authService.userId!;
  }

  @HostListener('keydown.tab', ['$event'])
  onTab(event: KeyboardEvent) {
    if(this.userSearchResponse()) {
      event.preventDefault();
      this.selectUser(this.userSearchResponse()!);
    }
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
    if (!this.isUserSelected() && user.userID !== this.currentUserId) {
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
    const selectedUsers = this.selectedUsers();
    const isGroup = selectedUsers.length > 1;

    const conversationList = this.conversationList();

    if (!isGroup) {
      const otherUserId = selectedUsers.find(x => x.userID !== this.authService.userId!)!.userID;
      const conversationExist = conversationList.find(x => x.otherUserId === otherUserId);
      if (conversationExist) {
        this.chatStateService.selectConversation(conversationExist.id);
        this.dialogRef.close();
        return;
      }
    }

    const request: CreateConversationRequest = {
      createdBy: this.authService.userId!,
      memberIdList: [...selectedUsers.map(user => user.userID), this.authService.userId!],
      name: isGroup ? this.groupName : '',
      type: isGroup ? ConversationType.Group : ConversationType.Direct
    };

    this.saveInProgress.set(true);

    this.conversationService.create(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: conversationId => {
          this.saveInProgress.set(false);

          const conversation: Conversation = {
            id: conversationId,
            lastMessage: null,
            lastMessageMetaData: null,
            lastMessageType: null,
            members: selectedUsers.map(x => x.userID),
            name: isGroup ? this.groupName : selectedUsers[0].name,
            conversationType: isGroup ? ConversationType.Group : ConversationType.Direct,
            otherUserId: isGroup ? null : selectedUsers[0].userID,
            hasMoreMessages: false,
            olderMessageLoading: signal(false),
            messages: signal(undefined),
            hasUnreadMessages: false,
            lastSeenMessageId: null,
          };

          this.chatStateService.addConversation(conversation);
          this.chatStateService.selectConversation(conversation.id);
          this.chatStateService.refreshLastMessage(conversation.id);
          this.dialogRef.close();
        },
        error: err => {
          this.saveInProgress.set(false);
        }
      });
  }

  onChangeGroupName() {
    this.groupName = this.groupName.trim();
  }
}
