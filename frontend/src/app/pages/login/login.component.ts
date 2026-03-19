import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatTabsModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon color="primary">task_alt</mat-icon>
            Task Manager
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <mat-tab-group>

            <!-- Login Tab -->
            <mat-tab label="Login">
              <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Username</mat-label>
                  <input matInput formControlName="username" autocomplete="username">
                  @if (loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched) {
                    <mat-error>Username is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Password</mat-label>
                  <input matInput type="password" formControlName="password" autocomplete="current-password">
                  @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                    <mat-error>Password is required</mat-error>
                  }
                </mat-form-field>

                @if (loginError) {
                  <p class="error-msg">{{ loginError }}</p>
                }

                <button mat-raised-button color="primary" type="submit"
                  class="full-width" [disabled]="loginLoading">
                  @if (loginLoading) { <mat-spinner diameter="20" /> } @else { Login }
                </button>
              </form>
            </mat-tab>

            <!-- Register Tab -->
            <mat-tab label="Register">
              <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Username</mat-label>
                  <input matInput formControlName="username" autocomplete="username">
                  @if (registerForm.get('username')?.hasError('required') && registerForm.get('username')?.touched) {
                    <mat-error>Username is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Password</mat-label>
                  <input matInput type="password" formControlName="password" autocomplete="new-password">
                  @if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
                    <mat-error>Password must be at least 6 characters</mat-error>
                  }
                </mat-form-field>

                @if (registerError) {
                  <p class="error-msg">{{ registerError }}</p>
                }

                <button mat-raised-button color="primary" type="submit"
                  class="full-width" [disabled]="registerLoading">
                  @if (registerLoading) { <mat-spinner diameter="20" /> } @else { Register }
                </button>
              </form>
            </mat-tab>

          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 24px;
    }
    .login-card {
      width: 100%;
      max-width: 420px;
    }
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 22px;
      padding: 8px 0;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 20px 0 8px;
    }
    .full-width { width: 100%; }
    .error-msg {
      color: #f44336;
      font-size: 13px;
      margin: 0;
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  registerForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loginError = '';
  loginLoading = false;
  registerError = '';
  registerLoading = false;

  onLogin() {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loginLoading = true;
    this.loginError = '';
    const { username, password } = this.loginForm.value;
    this.auth.login(username!, password!).subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: err => {
        this.loginError = err.error?.error || 'Login failed. Check your credentials.';
        this.loginLoading = false;
      }
    });
  }

  onRegister() {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.registerLoading = true;
    this.registerError = '';
    const { username, password } = this.registerForm.value;
    this.auth.register(username!, password!).subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: err => {
        this.registerError = err.error?.error || 'Registration failed.';
        this.registerLoading = false;
      }
    });
  }
}
