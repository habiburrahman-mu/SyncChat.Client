import { Component, signal } from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSidenavModule} from '@angular/material/sidenav';

@Component({
  selector: 'chat-chat',
  imports: [MatExpansionModule, MatSidenavModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  readonly panelOpenState = signal(false);
}
