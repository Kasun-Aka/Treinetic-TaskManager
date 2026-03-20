import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-shell">
      <!-- Ambient background orbs -->
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>

      <div class="auth-card">

        <!-- Brand -->
        <div class="brand">
          <div class="brand-icon">
            <mat-icon>task_alt</mat-icon>
          </div>
          <div>
            <h1 class="brand-name">Task Manager</h1>
            <p class="brand-sub">Organise your work, clearly.</p>
          </div>
        </div>

        <!-- Tab switcher -->
        <div class="tab-bar">
          <button class="tab-btn" [class.active]="activeTab === 'login'" (click)="activeTab='login'">Sign In</button>
          <button class="tab-btn" [class.active]="activeTab === 'register'" (click)="activeTab='register'">Register</button>
          <div class="tab-indicator" [class.right]="activeTab === 'register'"></div>
        </div>

        <!-- Login -->
        @if (activeTab === 'login') {
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form" [@.disabled]="true">
            <div class="field-group">
              <label class="field-label">Username</label>
              <div class="field-wrap" [class.error]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
                <mat-icon class="field-icon">person_outline</mat-icon>
                <input class="field-input" formControlName="username" placeholder="Enter username" autocomplete="username">
              </div>
              @if (loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched) {
                <span class="field-error">Username is required</span>
              }
            </div>

            <div class="field-group">
              <label class="field-label">Password</label>
              <div class="field-wrap" [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                <mat-icon class="field-icon">lock_outline</mat-icon>
                <input class="field-input" [type]="showLoginPw ? 'text' : 'password'" formControlName="password"
                  placeholder="Enter password" autocomplete="current-password">
                <button type="button" class="toggle-pw" (click)="showLoginPw = !showLoginPw">
                  <mat-icon>{{ showLoginPw ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <span class="field-error">Password is required</span>
              }
            </div>

            @if (loginError) {
              <div class="alert-error">
                <mat-icon>error_outline</mat-icon> {{ loginError }}
              </div>
            }

            <button class="submit-btn" type="submit" [disabled]="loginLoading">
              @if (loginLoading) {
                <mat-spinner diameter="18" />
              } @else {
                <span>Sign In</span>
                <mat-icon>arrow_forward</mat-icon>
              }
            </button>
          </form>
        }

        <!-- Register -->
        @if (activeTab === 'register') {
          <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="auth-form">
            <div class="field-group">
              <label class="field-label">Username</label>
              <div class="field-wrap" [class.error]="registerForm.get('username')?.invalid && registerForm.get('username')?.touched">
                <mat-icon class="field-icon">person_outline</mat-icon>
                <input class="field-input" formControlName="username" placeholder="Choose a username" autocomplete="username">
              </div>
              @if (registerForm.get('username')?.hasError('required') && registerForm.get('username')?.touched) {
                <span class="field-error">Username is required</span>
              }
            </div>

            <div class="field-group">
              <label class="field-label">Password</label>
              <div class="field-wrap" [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                <mat-icon class="field-icon">lock_outline</mat-icon>
                <input class="field-input" [type]="showRegPw ? 'text' : 'password'" formControlName="password"
                  placeholder="Min. 6 characters" autocomplete="new-password">
                <button type="button" class="toggle-pw" (click)="showRegPw = !showRegPw">
                  <mat-icon>{{ showRegPw ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              @if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
                <span class="field-error">Password must be at least 6 characters</span>
              }
            </div>

            @if (registerError) {
              <div class="alert-error">
                <mat-icon>error_outline</mat-icon> {{ registerError }}
              </div>
            }

            <button class="submit-btn" type="submit" [disabled]="registerLoading">
              @if (registerLoading) {
                <mat-spinner diameter="18" />
              } @else {
                <span>Create Account</span>
                <mat-icon>arrow_forward</mat-icon>
              }
            </button>
          </form>
        }

      </div>
    </div>
  `,
  styles: [`
    /* ── Shell ── */
    .auth-shell {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0d1117;
      padding: 24px;
      position: relative;
      overflow: hidden;
      font-family: 'DM Sans', 'Segoe UI', sans-serif;
    }

    /* Ambient orbs */
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
      animation: drift 12s ease-in-out infinite alternate;
    }
    .orb-1 {
      width: 420px; height: 420px;
      background: radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%);
      top: -100px; left: -120px;
    }
    .orb-2 {
      width: 360px; height: 360px;
      background: radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%);
      bottom: -80px; right: -80px;
      animation-delay: -6s;
    }
    @keyframes drift {
      from { transform: translate(0,0) scale(1); }
      to   { transform: translate(30px, 20px) scale(1.05); }
    }

    /* ── Card ── */
    .auth-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 420px;
      background: rgba(22, 27, 39, 0.85);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 40px 36px 36px;
      backdrop-filter: blur(20px);
      box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.06);
      animation: slideUp .45s cubic-bezier(.16,1,.3,1) both;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Brand ── */
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 32px;
    }
    .brand-icon {
      width: 46px; height: 46px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 20px rgba(245,158,11,0.35);
    }
    .brand-icon mat-icon { color: #0d1117; font-size: 24px; width: 24px; height: 24px; }
    .brand-name {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #f1f5f9;
      letter-spacing: -0.3px;
      font-family: 'Sora', 'DM Sans', sans-serif;
    }
    .brand-sub {
      margin: 2px 0 0;
      font-size: 12px;
      color: #64748b;
    }

    /* ── Tab bar ── */
    .tab-bar {
      position: relative;
      display: grid;
      grid-template-columns: 1fr 1fr;
      background: rgba(255,255,255,0.04);
      border-radius: 10px;
      padding: 4px;
      margin-bottom: 28px;
    }
    .tab-btn {
      position: relative;
      z-index: 1;
      background: none;
      border: none;
      cursor: pointer;
      padding: 9px 0;
      font-size: 13.5px;
      font-weight: 500;
      color: #64748b;
      border-radius: 7px;
      transition: color .25s;
      font-family: inherit;
    }
    .tab-btn.active { color: #f1f5f9; }
    .tab-indicator {
      position: absolute;
      top: 4px; left: 4px;
      width: calc(50% - 4px); height: calc(100% - 8px);
      background: rgba(255,255,255,0.09);
      border-radius: 7px;
      transition: transform .3s cubic-bezier(.16,1,.3,1);
      border: 1px solid rgba(255,255,255,0.07);
    }
    .tab-indicator.right { transform: translateX(calc(100% + 4px)); }

    /* ── Form ── */
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label {
      font-size: 12.5px;
      font-weight: 600;
      color: #94a3b8;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
    .field-wrap {
      display: flex;
      align-items: center;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 0 14px;
      gap: 10px;
      transition: border-color .2s, box-shadow .2s;
    }
    .field-wrap:focus-within {
      border-color: rgba(245,158,11,0.6);
      box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
    }
    .field-wrap.error { border-color: rgba(239,68,68,0.6); }
    .field-icon {
      color: #475569;
      font-size: 18px;
      width: 18px; height: 18px;
      flex-shrink: 0;
    }
    .field-input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      padding: 13px 0;
      font-size: 14px;
      color: #e2e8f0;
      font-family: inherit;
    }
    .field-input::placeholder { color: #334155; }
    .toggle-pw {
      background: none;
      border: none;
      cursor: pointer;
      color: #475569;
      display: flex; align-items: center;
      padding: 0;
      transition: color .2s;
    }
    .toggle-pw:hover { color: #94a3b8; }
    .toggle-pw mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .field-error { font-size: 12px; color: #f87171; }

    /* ── Alert ── */
    .alert-error {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      color: #fca5a5;
    }
    .alert-error mat-icon { font-size: 16px; width: 16px; height: 16px; }

    /* ── Submit button ── */
    .submit-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 13px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0d1117;
      font-size: 14.5px;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      letter-spacing: 0.2px;
      margin-top: 4px;
      transition: opacity .2s, transform .15s, box-shadow .2s;
      box-shadow: 0 4px 20px rgba(245,158,11,0.3);
      font-family: inherit;
    }
    .submit-btn:hover:not(:disabled) {
      opacity: .92;
      transform: translateY(-1px);
      box-shadow: 0 8px 28px rgba(245,158,11,0.4);
    }
    .submit-btn:active:not(:disabled) { transform: translateY(0); }
    .submit-btn:disabled { opacity: .5; cursor: not-allowed; }
    .submit-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .submit-btn mat-spinner { --mdc-circular-progress-active-indicator-color: #0d1117; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  activeTab: 'login' | 'register' = 'login';
  showLoginPw = false;
  showRegPw = false;

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