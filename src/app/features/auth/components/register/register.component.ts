import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
    GoogleIconComponent,
    CommonModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);

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

  form = this.fb.nonNullable.group({
    fullName: this.fb.nonNullable.control<string>('', {
      validators: [Validators.required, Validators.minLength(3)]
    }),
    userName: this.fb.nonNullable.control<string>('', {
      validators: [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]
    }),
    email: this.fb.nonNullable.control<string>('', {
      validators: [Validators.required, Validators.email]
    }),
    password: this.fb.nonNullable.control<string>('', {
      validators: [Validators.required, Validators.minLength(8)]
    }),
    confirmPassword: this.fb.nonNullable.control<string>('', {
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
      console.log('Form submitted:', this.form.value);
    }
  }
}
