import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/auth.service';
import { ToastService } from './core/toast.service';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary" class="app-toolbar fixed left-0 right-0 top-0 z-50 gap-3 !px-4 shadow-sm sm:gap-4 sm:!px-6">
      <a routerLink="/dashboard" class="text-lg font-semibold text-white no-underline sm:text-xl">Task Manager</a>
      <span class="flex-1"></span>
      <nav class="flex items-center gap-3 text-sm">
        <ng-container *ngIf="auth.currentUser; else guestLinks">
          <span class="hidden sm:inline">{{ auth.currentUser.username | displayName }} · {{ auth.currentUser.role }}</span>
          <button mat-raised-button type="button" class="loading-button" (click)="logout()" [disabled]="loggingOut">
            <mat-spinner *ngIf="loggingOut" diameter="18"></mat-spinner>
            <span>Logout</span>
          </button>
        </ng-container>
        <ng-template #guestLinks>
          <a mat-button routerLink="/login">Login</a>
          <a mat-raised-button routerLink="/register">Register</a>
        </ng-template>
      </nav>
    </mat-toolbar>
    <main class="pt-20">
      <div class="mx-auto max-w-7xl p-3 sm:p-6">
        <router-outlet></router-outlet>
      </div>
    </main>
  `
})
export class AppComponent {
  loggingOut = false;

  constructor(public auth: AuthService, private router: Router, private toast: ToastService) {}

  logout(): void {
    this.loggingOut = true;
    this.auth.logout();
    this.toast.success('Logout successful');
    this.router.navigate(['/login']).finally(() => {
      this.loggingOut = false;
    });
  }
}
