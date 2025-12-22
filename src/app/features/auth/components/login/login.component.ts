import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { AuthHttpService } from '@features/auth/services';

import { TokenRequest, TokenResponse } from '@features/auth/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoogleIconComponent } from '@shared/components';
import { CHAT_ROUTES } from '@features/chat/chat.routes';
import { FEATURE_ROUTE_PATH } from '@core/constants';
import { AuthService, LocalStorageService } from '@core/services';
import { LocalStorageKey } from '@core/enums';

@Component({
  selector: 'chat-login',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
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
  private readonly _router = inject(Router);
  private readonly _localStorageService = inject(LocalStorageService);
  private readonly _authService = inject(AuthService);

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

      this._authHttpService.login(tokenRequest)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: token => {
            this.storeToken(token);
            this.isLoginInProgress.set(false);
            this.routeToLChatHome();
            this._authService.setAuthState(true);
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
      password: this.form.value.password!,
      deviceIdentifier: this._authService.getDeviceIdentifier()
    };

    return request;
  }

  private storeToken(response: TokenResponse) {
    this._localStorageService.setItem(LocalStorageKey.Token, response.token);
    // this._localStorageService.setItem(LocalStorageKey.ExpirationInMinutes, response.expirationInMinutes);
  }

  private routeToLChatHome() {
    this._router.navigate([FEATURE_ROUTE_PATH.Chat]);
  }
}
