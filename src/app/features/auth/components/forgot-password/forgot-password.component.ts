import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthHttpService } from '@features/auth/services';
import { PasswordResetRequest } from '@features/auth/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AUTH_ROUTE_PATH, FEATURE_ROUTE_PATH } from '@core/constants';

@Component({
  selector: 'chat-forgot-password',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {
  private readonly _authHttpService = inject(AuthHttpService);
  private readonly _fb = inject(FormBuilder);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _router = inject(Router);

  public form = this._fb.nonNullable.group({
    userNameOrEmail: this._fb.nonNullable.control<string>('', { validators: [Validators.required] }),
  });

  readonly errorMessages = {
    userNameOrEmail: {
      required: 'Username or email is required',
    },
  };

  isRequestInProgress = signal<boolean>(false);
  isSuccess = signal<boolean>(false);

  public onSubmit() {
    if (this.form.valid) {
      this.isRequestInProgress.set(true);

      const request: PasswordResetRequest = {
        emailOrUserName: this.form.value.userNameOrEmail!,
      };

      this._authHttpService.passwordResetRequest(request)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: () => {
            this.isRequestInProgress.set(false);
            this.isSuccess.set(true);
          },
          error: () => {
            this.isRequestInProgress.set(false);
          }
        });
    }
  }

  public goBack() {
    this._router.navigate([FEATURE_ROUTE_PATH.Auth, AUTH_ROUTE_PATH.Login]);
  }
}
