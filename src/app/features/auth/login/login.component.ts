import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginRequest } from '../../../shared/models/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8)],
    }),
    rememberMe: new FormControl(false)
  });

  get isEmailInvalid() {
    return (
      this.form.controls.email.touched &&
      this.form.controls.email.dirty &&
      this.form.controls.email.invalid
    );
  }

  get isPasswordInvalid() {
    return (
      this.form.controls.password.touched &&
      this.form.controls.password.dirty &&
      this.form.controls.password.invalid
    );
  }

  onSubmit() {
    if (!this.form.value.email || !this.form.value.password)
      return; 
    const email = this.form.value.email;
    const password = this.form.value.password;
    const rememberMe = this.form.value.rememberMe ?? false;
    const user: LoginRequest = { email, password, rememberMe};
    this.authService.login(user).subscribe(ressponse  => {
      console.log(ressponse);
    })
  }
}
