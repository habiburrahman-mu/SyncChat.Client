import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/services';
import { ChatStateService, ConversationService } from '@features/chat/services';
import { catchError, filter, map, of, startWith, switchMap, tap } from 'rxjs';

@Component({
  selector: 'chat-detail-members',
  imports: [
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatMenuModule,
    CommonModule,
    MatIconModule
],
  templateUrl: './chat-detail-members.component.html',
  styleUrl: './chat-detail-members.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatDetailMembersComponent {
  private readonly chatStateService = inject(ChatStateService);
  private readonly conversationService = inject(ConversationService);
  private readonly authService = inject(AuthService);

  private conversation = this.chatStateService.selectedConversation;
  private conversation$ = toObservable(this.conversation);
  currentUserId = this.authService.userId!;
  readonly conversationMemberList = this.chatStateService.conversationMemberList;

  conversationMemberState$ = this.conversation$
    .pipe(
      filter(conversation => !!conversation),
      switchMap(conversation =>
        this.conversationService.getMembers(conversation.id)
        .pipe(
          tap(members => this.conversationMemberList.set(members)),
          map(members => ({isLoading: false, data: members, error: null})),
          startWith({isLoading: true, data: null, error: null}),
          catchError(error => of({isLoading: false, data: null, error: 'An error occurred while loading member list.'}))
        )
      ),
    );
}
