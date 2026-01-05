import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { AuthHttpService } from '@features/auth/services';

import { TokenRequest } from '@features/auth/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoogleIconComponent } from '@shared/components';
import { FEATURE_ROUTE_PATH } from '@core/constants';
import { AuthService, LocalStorageService } from '@core/services';
import { LocalStorageKey } from '@core/enums';
import { environment } from '@environments/environment';

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
export class LoginComponent implements AfterViewInit{
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

  ngAfterViewInit(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      auto_select: false,
      cancel_on_tap_outside: true,
      callback: (response: GoogleCredentialResponse) => {
        console.log(response);
      }
    });

    google.accounts.id.renderButton(
      document.getElementById('google-btn')!,
      { theme: 'outline', size: 'medium', text: 'continue_with' }
    );
  }

  public onSubmit() {
    if (this.form.valid) {
      this.isLoginInProgress.set(true);

      const tokenRequest = this.createRequest();

      this._authHttpService.login(tokenRequest)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: accessToken => {
            this.storeToken(accessToken);
            this.isLoginInProgress.set(false);
            this.routeToChatHome();
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

  private storeToken(accessToken: string) {
    this._localStorageService.setItem(LocalStorageKey.Token, accessToken);
    // this._localStorageService.setItem(LocalStorageKey.ExpirationInMinutes, response.expirationInMinutes);
  }

  private routeToChatHome() {
    this._router.navigate([FEATURE_ROUTE_PATH.Chat]);
  }
}
