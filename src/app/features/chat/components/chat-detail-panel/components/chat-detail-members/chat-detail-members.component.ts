import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConversationType } from '@core/enums';
import { AuthService } from '@core/services';
import { ChatStateService, ConversationService } from '@features/chat/services';
import { catchError, filter, map, of, startWith, switchMap, tap } from 'rxjs';
import { ChatAddMemberDialogComponent } from '../chat-add-member-dialog/chat-add-member-dialog.component';

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
  private readonly conversationService = inject(ConversationService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  conversation = this.chatStateService.selectedConversation;
  private conversation$ = toObservable(this.conversation);
  currentUserId = this.authService.userId!;
  readonly conversationMemberList = this.chatStateService.conversationMemberList;
  readonly ConversationType = ConversationType;

  conversationMemberState$ = this.conversation$
    .pipe(
      filter(conversation => !!conversation),
      switchMap(conversation =>
        this.conversationService.getMembers(conversation.id)
          .pipe(
            tap(members => this.conversationMemberList.set(members)),
            map(members => ({ isLoading: false, data: members, error: null })),
            startWith({ isLoading: true, data: null, error: null }),
            catchError(error => of({ isLoading: false, data: null, error: 'An error occurred while loading member list.' }))
          )
      ),
    );

  onClickAddMember() {
    const dialogRef = this.dialog.open<ChatAddMemberDialogComponent, undefined, boolean>(ChatAddMemberDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed()
      .subscribe(needRefresh => {

      });
  }
}
