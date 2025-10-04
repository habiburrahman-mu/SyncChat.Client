import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConversationType, MemberRole } from '@core/enums';
import { AuthService } from '@core/services';
import { ChatStateService, ConversationMemberService } from '@features/chat/services';
import { catchError, combineLatest, filter, map, of, startWith, Subject, switchMap, tap } from 'rxjs';
import { ChatAddMemberDialogComponent } from '../chat-add-member-dialog/chat-add-member-dialog.component';
import { ConversationMemberDTO } from '@features/chat/models';
import { MemberActionDialogComponent } from '../member-action-dialog/member-action-dialog.component';

@Component({
  selector: 'chat-detail-members',
  imports: [
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatMenuModule,
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule
  ],
  templateUrl: './chat-detail-members.component.html',
  styleUrl: './chat-detail-members.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatDetailMembersComponent {
  private readonly chatStateService = inject(ChatStateService);
  private readonly conversationMemberService = inject(ConversationMemberService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  conversation = this.chatStateService.selectedConversation;
  private conversation$ = toObservable(this.conversation);
  currentUserId = this.authService.userId!;
  readonly conversationMemberList = this.chatStateService.conversationMemberList;
  readonly ConversationType = ConversationType;

  private readonly refreshConversationMembers$ = new Subject<void>();

  conversationMemberState$ = combineLatest([
    this.conversation$.pipe(filter(conversation => !!conversation)),
    this.refreshConversationMembers$.pipe(startWith(void 0)),
    this.chatStateService.memberAddedToSelectedConversation$.pipe(startWith(void 0))
  ]).pipe(
    switchMap(([conversation]) =>
      this.conversationMemberService.getList(conversation.id).pipe(
        tap(members => {
          this.conversationMemberList.set(members);
        }),
        map(members => ({ isLoading: false, data: members, error: null })),
        startWith({ isLoading: true, data: null, error: null }),
        catchError(() =>
          of({
            isLoading: false,
            data: null,
            error: 'An error occurred while loading member list.'
          })
        )
      )
    )
  );

  isCurrentUserAdmin = computed(() => {
    const members = this.conversationMemberList();
    const currentUser = members.find(x => x.userID === this.currentUserId);
    return currentUser!.role === MemberRole.Admin;
  });

  isCurrentUserOwner = computed(() => {
    const members = this.conversationMemberList();
    const currentUser = members.find(x => x.userID === this.currentUserId);
    return currentUser!.role === MemberRole.Owner;
  });

  onClickAddMember() {
    const dialogRef = this.dialog.open<ChatAddMemberDialogComponent, undefined, boolean>(ChatAddMemberDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(needRefresh => {
        if (needRefresh) {
          this.refreshConversationMembers$.next();
        }
      });
  }

  onClickMemberCard(member: ConversationMemberDTO) {
    if(this.isCurrentUserAdmin() || this.isCurrentUserOwner()) {
      const dialogRef = this.dialog.open<MemberActionDialogComponent>(MemberActionDialogComponent, {
      width: '400px',
    });
    }
  }
}
