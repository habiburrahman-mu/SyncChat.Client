import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ChatSidebarComponent } from "../chat-sidebar/chat-sidebar.component";
import { ChatStateService } from '@features/chat/services';
import { ChatThreadComponent } from '../chat-thread/chat-thread.component';

@Component({
  selector: 'chat-chat',
  imports: [
    ChatSidebarComponent,
    ChatThreadComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatComponent implements OnInit, OnDestroy {

  private readonly chatStateService = inject(ChatStateService);

  ngOnInit(): void {
    this.chatStateService.onInitialize();
  }

  ngOnDestroy(): void {
    this.chatStateService.onDestroy();
  }
}
