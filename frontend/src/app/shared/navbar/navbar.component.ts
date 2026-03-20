import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, CommonModule],
  template: `
    <mat-toolbar color="primary">
      <mat-icon>task_alt</mat-icon>
      <span style="margin-left:8px; font-weight:500">Task Manager</span>
      <span style="flex:1"></span>
      @if (auth.isLoggedIn()) {
        <span style="margin-right:16px; font-size:14px; padding:2px 5px; color:#0d1117; background-color:orange; border-radius:8px;">{{ auth.getUsername() }}</span>
        <button mat-button (click)="auth.logout()">
          <mat-icon>logout</mat-icon> Logout
        </button>
      }
    </mat-toolbar>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
}
