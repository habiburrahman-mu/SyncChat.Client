import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'chat-detail-members',
  imports: [
    MatExpansionModule
  ],
  templateUrl: './chat-detail-members.component.html',
  styleUrl: './chat-detail-members.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatDetailMembersComponent {

}
