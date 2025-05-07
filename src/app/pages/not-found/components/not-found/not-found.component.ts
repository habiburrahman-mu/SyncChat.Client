import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'chat-not-found',
  imports: [LottieComponent, RouterModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
  options: AnimationOptions = {
    path: 'assets/animations/not-found.json', // adjust this to your actual file path
    loop: true,
    autoplay: true
  };
}
