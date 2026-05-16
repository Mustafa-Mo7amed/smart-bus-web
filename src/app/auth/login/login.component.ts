import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../shared/models/auth.model';
import { Router } from '@angular/router';

function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  const withoutSpaces = value.replace(/\s/g, '');
  if (withoutSpaces.length < 10) {
    return { invalidPhoneLength: true };
  }
  return null;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  form = new FormGroup({
    phoneNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, phoneValidator],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    rememberMe: new FormControl(false, { nonNullable: true })
  });

  get isPhoneInvalid() {
    const control = this.form.controls.phoneNumber;
    return control.touched && control.dirty && control.invalid;
  }

  get isPasswordInvalid() {
    const control = this.form.controls.password;
    return control.touched && control.dirty && control.invalid;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { phoneNumber, password, rememberMe } = this.form.getRawValue();
    const loginData: LoginRequest = { phoneNumber, password, rememberMe };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Login failed:', err);
      }
    });
  }
}
