import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { ToasterService } from '@core/services';
import { AuthHttpService } from '@features/auth/services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'chat-login',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LottieComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  options: AnimationOptions = {
    path: 'assets/animations/login.json',
    loop: true,
    autoplay: true
  };

  private readonly _authHttpService = inject(AuthHttpService);
  private readonly _fb = inject(FormBuilder);

  public form = this._fb.nonNullable.group({
    email: this._fb.nonNullable.control<string>('', { validators: [Validators.required, Validators.email] }),
    password: this._fb.nonNullable.control<string>('', { validators: [Validators.required] }),
  });

  readonly errorMessages = {
    email: {
      required: 'Email is required',
      email: 'Please enter a valid email'
    },
    password: {
      required: 'Password is required',
    },
  };

  public onSubmit() {

  }
}
