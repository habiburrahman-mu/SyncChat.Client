import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ChatSidebarComponent } from "../chat-sidebar/chat-sidebar.component";
import { ChatStateService } from '@features/chat/services';
import { ChatThreadComponent } from '../chat-thread/chat-thread.component';
import { ChatDetailPanelComponent } from "../chat-detail-panel/chat-detail-panel.component";
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'chat-chat',
  imports: [
    ChatSidebarComponent,
    ChatThreadComponent,
    ChatDetailPanelComponent,
    MatSidenavModule
],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
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
