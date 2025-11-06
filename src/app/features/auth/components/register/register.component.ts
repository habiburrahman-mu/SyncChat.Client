
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RegisterUserRequest } from '@features/auth/models';
import { AuthHttpService } from '@features/auth/services';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToasterService } from '@core/services';
import { GoogleIconComponent } from '@shared/components';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AUTH_ROUTE_PATH } from '@core/constants';

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
    MatProgressSpinnerModule,
    MatIconModule,
    LottieComponent,
    GoogleIconComponent
],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent implements OnInit {

  private readonly _fb = inject(FormBuilder);
  private readonly _authHttpService = inject(AuthHttpService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _toasterService = inject(ToasterService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  readonly options: AnimationOptions = {
    path: 'assets/animations/register.json',
    loop: true,
    autoplay: true
  };

  private confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) return null;
    const password = control.parent.get('password')?.value;
    const confirmPassword = control.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  };

  form = this._fb.nonNullable.group({
    fullName: this._fb.nonNullable.control<string>('', {
      validators: [Validators.required, Validators.minLength(3)]
    }),
    userName: this._fb.nonNullable.control<string>('', {
      validators: [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]
    }),
    email: this._fb.nonNullable.control<string>('', {
      validators: [Validators.required, Validators.email]
    }),
    password: this._fb.nonNullable.control<string>('', {
      validators: [Validators.required, Validators.minLength(8)]
    },),
    confirmPassword: this._fb.nonNullable.control<string>('', {
      validators: [Validators.required, this.confirmPasswordValidator]
    })
  });

  readonly errorMessages = {
    fullName: {
      required: 'Full name is required',
      minlength: 'Full name must be at least 3 characters'
    },
    userName: {
      required: 'Username is required',
      minlength: 'Username must be at least 3 characters',
      pattern: 'Only letters, numbers and underscores allowed'
    },
    email: {
      required: 'Email is required',
      email: 'Please enter a valid email'
    },
    password: {
      required: 'Password is required',
      minlength: 'Password must be at least 8 characters'
    },
    confirmPassword: {
      required: 'Please confirm your password',
      passwordMismatch: 'Passwords do not match'
    }
  };

  showPassword = false;
  isRegistering = signal<boolean>(false);

  ngOnInit(): void {
    this.setupPasswordConfirmationWatcher();
  }

  private setupPasswordConfirmationWatcher() {
    this.form.controls.password.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.form.controls.confirmPassword.updateValueAndValidity();
      });
  }

  onSubmit() {
    if (this.form.valid) {
      this.isRegistering.set(true);

      const registerUserRequest = this.createRequest();

      this._authHttpService.register(registerUserRequest)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: response => {
            this.isRegistering.set(false);
            this._toasterService.success("Registered successfully.");
            this.routeToLogin();
          },
          error: err => {
            this.isRegistering.set(false);
          }
        });
    }
    else {
      this.form.markAllAsTouched();
      this._toasterService.invalidForm();
    }
  }

  private createRequest(): RegisterUserRequest {
    return {
      userName: this.form.value.userName!,
      name: this.form.value.fullName!,
      email: this.form.value.email!,
      password: this.form.value.password!
    };
  }

  private routeToLogin() {
    this._router.navigate(['../', AUTH_ROUTE_PATH.Login], { relativeTo: this._route });
  }
}
