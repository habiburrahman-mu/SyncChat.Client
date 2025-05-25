import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { GoogleIconComponent } from 'app/shared/components/google-icon/google-icon.component';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'chat-register',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LottieComponent,
    GoogleIconComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);

  readonly options: AnimationOptions = {
    path: 'assets/animations/register.json',
    loop: true,
    autoplay: true
  };

  form = this.fb.nonNullable.group({
    fullName: this.fb.nonNullable.control<string>('', [Validators.required, Validators.minLength(3)])
  });
}
