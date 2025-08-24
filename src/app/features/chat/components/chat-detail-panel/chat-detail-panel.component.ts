import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChatDetailInfoComponent } from './components/chat-detail-info/chat-detail-info.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ChatDetailMembersComponent } from "./components/chat-detail-members/chat-detail-members.component";

@Component({
  selector: 'chat-detail-panel',
  imports: [
    ChatDetailInfoComponent,
    ChatDetailMembersComponent
],
  templateUrl: './chat-detail-panel.component.html',
  styleUrl: './chat-detail-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatDetailPanelComponent {

}
