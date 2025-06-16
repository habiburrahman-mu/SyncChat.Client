import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { AuthHttpService } from '@features/auth/services';
import { CommonModule } from '@angular/common';
import { TokenRequest, TokenResponse } from '@features/auth/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoogleIconComponent } from '@shared/components';

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
    MatIconModule,
    MatProgressSpinnerModule,

    LottieComponent,
    GoogleIconComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  options: AnimationOptions = {
    path: 'assets/animations/login.json',
    loop: true,
    autoplay: true
  };

  private readonly _authHttpService = inject(AuthHttpService);
  private readonly _fb = inject(FormBuilder);
  private readonly _destroyRef = inject(DestroyRef);

  public form = this._fb.nonNullable.group({
    userName: this._fb.nonNullable.control<string>('', { validators: [Validators.required] }),
    password: this._fb.nonNullable.control<string>('', { validators: [Validators.required] }),
  });

  readonly errorMessages = {
    userName: {
      required: 'Username is required',
    },
    password: {
      required: 'Password is required',
    },
  };

  isLoginInProgress = signal<boolean>(false);

  public onSubmit() {
    if (this.form.valid) {
      this.isLoginInProgress.set(true);

      const tokenRequest = this.createRequest();

      this._authHttpService.getToken(tokenRequest)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: token => {
            this.storeToken(token);
            this.isLoginInProgress.set(false);
          },
          error: _ => {
            this.isLoginInProgress.set(false);
          }
        });
    }
  }

  private createRequest() {
    const request: TokenRequest = {
      userName: this.form.value.userName!,
      password: this.form.value.password!
    };

    return request;
  }

  private storeToken(token: TokenResponse) {

  }
}
