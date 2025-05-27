import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { RegisterUserRequest } from '@features/auth/models';
import { AuthHttpService } from '@features/auth/services';
import { GoogleIconComponent } from 'app/shared/components/google-icon/google-icon.component';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToasterService } from '@core/services';
import { ToasterType } from '@core/types';

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
    GoogleIconComponent,
    CommonModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {

  private readonly _fb = inject(FormBuilder);
  private readonly _authHttpService = inject(AuthHttpService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _toasterService = inject(ToasterService)

  readonly options: AnimationOptions = {
    path: 'assets/animations/register.json',
    loop: true,
    autoplay: true
  };

  private passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {

    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

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
    }),
    confirmPassword: this._fb.nonNullable.control<string>('', {
      validators: [Validators.required]
    })
  }, {
    validators: [this.passwordMatchValidator],
    updateOn: "change"
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

  onSubmit() {
    if (this.form.valid) {
      const registerUserRequest: RegisterUserRequest = {
        userName: this.form.value.userName!,
        name: this.form.value.fullName!,
        email: this.form.value.email!,
        password: this.form.value.password!
      };

      this._authHttpService.register(registerUserRequest)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: response => {
            this._snackBar.open("Saved successfully");
          },
          error: err => {
            console.error(err);
            this._snackBar.open("Error!");
          }
        });
    }
  }

  showToast(type: ToasterType) {
    this._toasterService.show(`This is a ${type} toast!`, type);
  }
}
