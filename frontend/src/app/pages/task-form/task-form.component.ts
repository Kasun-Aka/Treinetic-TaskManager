import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="form-shell">

      <!-- Back nav -->
      <a routerLink="/tasks" class="back-link">
        <mat-icon>arrow_back</mat-icon>
        <span>All Tasks</span>
      </a>

      <div class="form-header">
        <div class="form-title-row">
          <div class="form-badge">{{ isEdit ? 'Edit' : 'New' }}</div>
          <h1>{{ isEdit ? 'Update Task' : 'Create Task' }}</h1>
        </div>
        <p class="form-subtitle">{{ isEdit ? 'Modify the details below and save.' : 'Fill in the details to add a new task.' }}</p>
      </div>

      <div class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- Title -->
          <div class="field-block">
            <label class="field-label">
              <mat-icon>title</mat-icon> Title
            </label>
            <input class="field-input"
              [class.invalid]="form.get('title')?.invalid && form.get('title')?.touched"
              formControlName="title" placeholder="What needs to be done?" />
            <div class="field-meta">
              @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
                <span class="field-error">Title is required</span>
              } @else if (form.get('title')?.hasError('maxlength')) {
                <span class="field-error">Max 100 characters</span>
              } @else { <span></span> }
              <span class="char-count" [class.over]="(form.get('title')?.value?.length || 0) > 90">
                {{ form.get('title')?.value?.length || 0 }}/100
              </span>
            </div>
          </div>

          <!-- Description -->
          <div class="field-block">
            <label class="field-label">
              <mat-icon>notes</mat-icon> Description <span class="optional-tag">optional</span>
            </label>
            <textarea class="field-input field-textarea"
              [class.invalid]="form.get('description')?.invalid && form.get('description')?.touched"
              formControlName="description"
              placeholder="Add more context, links, or notes…"
              rows="4"></textarea>
            @if (form.get('description')?.hasError('maxlength')) {
              <span class="field-error">Max 500 characters</span>
            }
          </div>

          <!-- Status -->
          <div class="field-block">
            <label class="field-label"><mat-icon>flag</mat-icon> Status</label>
            <div class="status-grid">
              @for (opt of statusOptions; track opt.value) {
                <button type="button" class="status-opt"
                  [class.selected]="form.get('status')?.value === opt.value"
                  [attr.data-status]="opt.value"
                  (click)="form.get('status')?.setValue(opt.value)">
                  <span class="status-dot"></span>
                  {{ opt.label }}
                </button>
              }
            </div>
          </div>

          @if (error) {
            <div class="alert-error">
              <mat-icon>error_outline</mat-icon> {{ error }}
            </div>
          }

          <div class="form-actions">
            <a routerLink="/tasks" class="btn-cancel">Cancel</a>
            <button type="submit" class="btn-submit" [disabled]="loading">
              @if (loading) {
                <mat-spinner diameter="18" />
              } @else {
                <mat-icon>{{ isEdit ? 'save' : 'add_task' }}</mat-icon>
                {{ isEdit ? 'Save Changes' : 'Create Task' }}
              }
            </button>
          </div>

        </form>
      </div>

    </div>
  `,
  styles: [`
    /* ── Shell ── */
    .form-shell {
      min-height: 100vh;
      background: #0d1117;
      padding: 32px 24px 64px;
      font-family: 'DM Sans', 'Segoe UI', sans-serif;
      color: #e2e8f0;
      max-width: 680px;
      margin: 0 auto;
    }

    /* ── Back link ── */
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #64748b;
      text-decoration: none;
      font-size: 13.5px;
      font-weight: 500;
      margin-bottom: 32px;
      transition: color .2s;
    }
    .back-link:hover { color: #f59e0b; }
    .back-link mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* ── Header ── */
    .form-header { margin-bottom: 28px; }
    .form-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
    }
    .form-badge {
      background: rgba(245,158,11,0.15);
      color: #f59e0b;
      border: 1px solid rgba(245,158,11,0.3);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 3px 10px;
      border-radius: 20px;
    }
    h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      color: #f1f5f9;
      font-family: 'Sora', 'DM Sans', sans-serif;
      letter-spacing: -0.4px;
    }
    .form-subtitle {
      margin: 0;
      font-size: 13.5px;
      color: #475569;
    }

    /* ── Card ── */
    .form-card {
      background: rgba(22, 27, 39, 0.9);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 18px;
      padding: 32px;
      backdrop-filter: blur(12px);
      box-shadow: 0 16px 48px rgba(0,0,0,0.4);
      animation: fadeUp .4s cubic-bezier(.16,1,.3,1) both;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Field block ── */
    .field-block {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 24px;
    }
    .field-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      font-weight: 600;
      color: #94a3b8;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }
    .field-label mat-icon { font-size: 15px; width: 15px; height: 15px; color: #64748b; }
    .optional-tag {
      font-size: 11px;
      color: #334155;
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0;
    }
    .field-input {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 14.5px;
      color: #e2e8f0;
      font-family: inherit;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
      resize: none;
    }
    .field-input::placeholder { color: #334155; }
    .field-input:focus {
      border-color: rgba(245,158,11,0.5);
      box-shadow: 0 0 0 3px rgba(245,158,11,0.09);
    }
    .field-input.invalid { border-color: rgba(239,68,68,0.5); }
    .field-textarea { min-height: 110px; line-height: 1.6; }

    .field-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .field-error { font-size: 12px; color: #f87171; }
    .char-count { font-size: 11px; color: #334155; }
    .char-count.over { color: #f87171; }

    /* ── Status grid ── */
    .status-grid { display: flex; gap: 10px; flex-wrap: wrap; }
    .status-opt {
      flex: 1;
      min-width: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 16px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 10px;
      color: #64748b;
      font-size: 13.5px;
      font-weight: 500;
      cursor: pointer;
      transition: all .2s;
      font-family: inherit;
    }
    .status-opt:hover { border-color: rgba(255,255,255,0.18); color: #94a3b8; }
    .status-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: currentColor;
      opacity: .5;
    }

    /* Status colour overrides */
    .status-opt[data-status="TO_DO"].selected        { background: rgba(59,130,246,0.12); border-color: rgba(59,130,246,0.4); color: #93c5fd; }
    .status-opt[data-status="IN_PROGRESS"].selected  { background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.4); color: #fcd34d; }
    .status-opt[data-status="DONE"].selected         { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.4); color: #6ee7b7; }
    .status-opt[data-status="TO_DO"].selected .status-dot        { opacity: 1; background: #93c5fd; }
    .status-opt[data-status="IN_PROGRESS"].selected .status-dot  { opacity: 1; background: #fcd34d; }
    .status-opt[data-status="DONE"].selected .status-dot         { opacity: 1; background: #6ee7b7; }

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
      margin-bottom: 20px;
    }
    .alert-error mat-icon { font-size: 16px; width: 16px; height: 16px; }

    /* ── Actions ── */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      margin-top: 8px;
    }
    .btn-cancel {
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      color: #64748b;
      text-decoration: none;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.08);
      transition: all .2s;
      font-family: inherit;
    }
    .btn-cancel:hover { color: #94a3b8; border-color: rgba(255,255,255,0.15); }
    .btn-submit {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 11px 22px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0d1117;
      font-size: 14px;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: opacity .2s, transform .15s, box-shadow .2s;
      box-shadow: 0 4px 18px rgba(245,158,11,0.3);
      font-family: inherit;
    }
    .btn-submit mat-icon { font-size: 17px; width: 17px; height: 17px; }
    .btn-submit:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); box-shadow: 0 8px 26px rgba(245,158,11,0.4); }
    .btn-submit:disabled { opacity: .45; cursor: not-allowed; }
    .btn-submit mat-spinner { --mdc-circular-progress-active-indicator-color: #0d1117; }
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

  statusOptions = [
    { value: 'TO_DO',       label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE',        label: 'Done' }
  ];

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
        this.snackBar.open(`Task ${this.isEdit ? 'updated' : 'created'}!`, '✕', { duration: 2500 });
        this.router.navigate(['/tasks']);
      },
      error: err => {
        this.error = err.error?.title || err.error?.error || 'Something went wrong.';
        this.loading = false;
      }
    });
  }
}