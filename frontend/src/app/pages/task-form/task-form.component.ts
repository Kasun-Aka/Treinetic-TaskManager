import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="form-header">
        <button mat-icon-button routerLink="/tasks">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEdit ? 'Edit Task' : 'New Task' }}</h1>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" placeholder="Task title">
              @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
                <mat-error>Title is required</mat-error>
              }
              @if (form.get('title')?.hasError('maxlength')) {
                <mat-error>Title must be under 100 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="4"
                placeholder="Optional description"></textarea>
              @if (form.get('description')?.hasError('maxlength')) {
                <mat-error>Description must be under 500 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="TO_DO">To Do</mat-option>
                <mat-option value="IN_PROGRESS">In Progress</mat-option>
                <mat-option value="DONE">Done</mat-option>
              </mat-select>
            </mat-form-field>

            @if (error) {
              <p class="error-msg">{{ error }}</p>
            }

            <div class="form-actions">
              <button mat-button type="button" routerLink="/tasks">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="loading">
                @if (loading) { <mat-spinner diameter="20" /> }
                @else { {{ isEdit ? 'Update' : 'Create' }} }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
    }
    h1 { font-size: 24px; font-weight: 500; }
    .form-card { max-width: 640px; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
    .error-msg { color: #f44336; font-size: 13px; margin-bottom: 12px; }
  `]
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
    status: ['TO_DO', Validators.required]
  });

  isEdit = false;
  taskId!: number;
  loading = false;
  error = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.taskId = +id;
      this.taskService.getById(this.taskId).subscribe({
        next: task => this.form.patchValue(task),
        error: () => this.router.navigate(['/tasks'])
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const payload = this.form.value as any;
    const request = this.isEdit
      ? this.taskService.update(this.taskId, payload)
      : this.taskService.create(payload);

    request.subscribe({
      next: () => {
        this.snackBar.open(`Task ${this.isEdit ? 'updated' : 'created'}!`, 'Close', { duration: 2500 });
        this.router.navigate(['/tasks']);
      },
      error: err => {
        this.error = err.error?.title || err.error?.error || 'Something went wrong.';
        this.loading = false;
      }
    });
  }
}
