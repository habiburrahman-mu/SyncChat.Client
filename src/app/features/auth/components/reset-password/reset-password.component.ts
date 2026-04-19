import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthHttpService } from '@features/auth/services';
import { PasswordResetVerify, PasswordResetComplete } from '@features/auth/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AUTH_ROUTE_PATH, FEATURE_ROUTE_PATH } from '@core/constants';

@Component({
  selector: 'chat-reset-password',
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
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit {
  private readonly _authHttpService = inject(AuthHttpService);
  private readonly _fb = inject(FormBuilder);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  public form = this._fb.nonNullable.group({
    newPassword: this._fb.nonNullable.control<string>('', {
      validators: [Validators.required, Validators.minLength(8)]
    }),
    confirmPassword: this._fb.nonNullable.control<string>('', {
      validators: [Validators.required]
    }),
  }, { validators: this.passwordMatchValidator });

  readonly errorMessages = {
    newPassword: {
      required: 'New password is required',
      minlength: 'Password must be at least 8 characters',
    },
    confirmPassword: {
      required: 'Please confirm your password',
      mismatch: 'Passwords do not match',
    },
  };

  token = signal<string>('');
  isVerifying = signal<boolean>(true);
  isTokenValid = signal<boolean>(false);
  isResetInProgress = signal<boolean>(false);
  isSuccess = signal<boolean>(false);

  ngOnInit() {
    const tokenParam = this._route.snapshot.queryParamMap.get('token');
    if (tokenParam) {
      this.token.set(tokenParam);
      this.verifyToken(tokenParam);
    } else {
      this.isVerifying.set(false);
    }
  }

  private verifyToken(token: string) {
    const request: PasswordResetVerify = { token };

    this._authHttpService.passwordResetVerify(request)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this.isVerifying.set(false);
          this.isTokenValid.set(true);
        },
        error: () => {
          this.isVerifying.set(false);
          this.isTokenValid.set(false);
        }
      });
  }

  private passwordMatchValidator(form: any) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  public onSubmit() {
    if (this.form.valid && this.token()) {
      this.isResetInProgress.set(true);

      const request: PasswordResetComplete = {
        token: this.token(),
        newPassword: this.form.value.newPassword!,
      };

      this._authHttpService.passwordResetComplete(request)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: () => {
            this.isResetInProgress.set(false);
            this.isSuccess.set(true);
          },
          error: () => {
            this.isResetInProgress.set(false);
          }
        });
    }
  }

  public goToLogin() {
    this._router.navigate([FEATURE_ROUTE_PATH.Auth, AUTH_ROUTE_PATH.Login]);
  }
}
