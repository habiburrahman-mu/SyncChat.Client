import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, filter, map, of, startWith, switchMap } from 'rxjs';
import { ConversationType, MessageType } from '@core/enums';
import { ChatStateService, ConversationService } from '@features/chat/services';
import { ChatMediaImageComponent } from '../../../chat-media-image/chat-media-image.component';

@Component({
  selector: 'chat-detail-info',
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ChatMediaImageComponent,
  ],
  templateUrl: './chat-detail-info.component.html',
  styleUrl: './chat-detail-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatDetailInfoComponent {
  private readonly chatStateService = inject(ChatStateService);
  private readonly conversationService = inject(ConversationService);

  readonly conversation = this.chatStateService.selectedConversation;
  private readonly conversation$ = toObservable(this.conversation);

  readonly ConversationType = ConversationType;
  readonly MessageType = MessageType;

  readonly memberCount = computed(() =>
    this.chatStateService.conversationMemberList().filter(m => m.isActive).length
  );

  readonly sharedMedia = computed(() => {
    const messages = this.conversation()?.messages() ?? [];
    return messages
      .filter(m => m.mediaId != null && (
        m.type === MessageType.Image ||
        m.type === MessageType.Video ||
        m.type === MessageType.File
      ))
      .slice()
      .reverse();
  });

  readonly detailState$ = this.conversation$.pipe(
    filter(c => !!c),
    switchMap(c =>
      this.conversationService.getDetail(c!.id).pipe(
        map(detail => ({ isLoading: false, data: detail, error: null })),
        startWith({ isLoading: true, data: null, error: null }),
        catchError(() => of({ isLoading: false, data: null, error: 'Failed to load conversation details.' }))
      )
    )
  );
}
