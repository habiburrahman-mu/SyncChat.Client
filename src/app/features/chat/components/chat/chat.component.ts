import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ChatSidebarComponent } from "../chat-sidebar/chat-sidebar.component";
import { ChatStateService } from '@features/chat/services';
import { ChatThreadComponent } from '../chat-thread/chat-thread.component';
import { ChatDetailPanelComponent } from "../chat-detail-panel/chat-detail-panel.component";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'chat-chat',
  imports: [
    ChatSidebarComponent,
    ChatThreadComponent,
    ChatDetailPanelComponent,
    MatSidenavModule,
    MatIconModule
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy {

  private readonly chatStateService = inject(ChatStateService);

  readonly isChatDetailPanelOpen = this.chatStateService.chatDetailPanelOpen;

  readonly selectedConversation = this.chatStateService.selectedConversation;

  readonly chatListPanelOpen = this.chatStateService.chatListPanelOpen;
  readonly chatListPanelPinned = this.chatStateService.chatListPanelPinned;

  ngOnInit(): void {
    this.chatStateService.onInitialize();
  }

  ngOnDestroy(): void {
    this.chatStateService.onDestroy();
  }


}
