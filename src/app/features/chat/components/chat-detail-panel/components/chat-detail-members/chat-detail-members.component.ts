import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatStateService, ConversationService } from '@features/chat/services';
import { catchError, filter, map, of, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'chat-detail-members',
  imports: [
    MatExpansionModule,
    MatProgressSpinnerModule,
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

  private conversation = this.chatStateService.selectedConversation;
  private conversation$ = toObservable(this.conversation);

  conversationMemberState$ = this.conversation$
    .pipe(
      filter(conversation => !!conversation),
      switchMap(conversation =>
        this.conversationService.getMembers(conversation.id)
        .pipe(
          map(members => ({isLoading: false, data: members, error: null})),
          startWith({isLoading: true, data: null, error: null}),
          catchError(error => of({isLoading: false, data: null, error: 'An error occurred while loading member list.'}))
        )
      ),
    );
}
