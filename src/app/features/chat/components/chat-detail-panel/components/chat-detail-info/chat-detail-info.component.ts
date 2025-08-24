import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'chat-detail-info',
  imports: [
    MatExpansionModule
  ],
  templateUrl: './chat-detail-info.component.html',
  styleUrl: './chat-detail-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatDetailInfoComponent {

}
