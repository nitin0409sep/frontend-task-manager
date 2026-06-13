import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { apiErrorMessage } from '../../core/http-error';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  loading = false;
  showPassword = false;
  error = '';

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      username: this.form.controls.username.value || '',
      email: this.form.controls.email.value || '',
      password: this.form.controls.password.value || ''
    };

    this.loading = true;
    this.error = '';
    this.auth.register(payload).subscribe({
      next: () => {
        this.toast.success('Registration successful');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.error = apiErrorMessage(error, 'Registration failed');
        this.loading = false;
      }
    });
  }
}
