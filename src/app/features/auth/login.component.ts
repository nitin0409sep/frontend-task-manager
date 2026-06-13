import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { apiErrorMessage } from '../../core/http-error';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loading = false;
  showPassword = false;
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
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
      email: this.form.controls.email.value || '',
      password: this.form.controls.password.value || ''
    };

    this.loading = true;
    this.error = '';
    this.auth.login(payload).subscribe({
      next: () => {
        this.toast.success('Login successful');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.toast.error(apiErrorMessage(error, 'Login failed'));
        this.loading = false;
      }
    });
  }
}
