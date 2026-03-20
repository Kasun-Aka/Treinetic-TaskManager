import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus } from '../../models/task.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatIconModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatDialogModule
  ],
  template: `
    <div class="list-shell">

      <!-- Top bar -->
      <div class="top-bar">
        <div>
          <h1 class="page-title">My Tasks</h1>
          <p class="page-sub">{{ tasks.length }} task{{ tasks.length !== 1 ? 's' : '' }} {{ selectedStatus ? 'filtered' : 'total' }}</p>
        </div>
        <a routerLink="/tasks/new" class="btn-new">
          <mat-icon>add</mat-icon> New Task
        </a>
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        @for (stat of stats; track stat.status) {
          <button class="stat-card" [class.active]="selectedStatus === stat.status"
            [attr.data-status]="stat.status" (click)="setFilter(stat.status)">
            <span class="stat-count">{{ stat.count }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </button>
        }
      </div>

      @if (loading) {
        <div class="spinner-wrap"><mat-spinner diameter="36" /></div>
      } @else if (tasks.length === 0) {
        <div class="empty-state">
          <div class="empty-icon-wrap">
            <mat-icon>inbox</mat-icon>
          </div>
          <p class="empty-title">No tasks found</p>
          <p class="empty-sub">{{ selectedStatus ? 'Try changing your filter.' : 'Create your first task to get started.' }}</p>
        </div>
      } @else {
        <div class="task-list">
          @for (task of tasks; track task.id) {
            <div class="task-row" [attr.data-status]="task.status">
              <div class="task-status-bar"></div>
              <div class="task-body">
                <div class="task-main">
                  <span class="task-title">{{ task.title }}</span>
                  <span class="status-badge" [attr.data-status]="task.status">
                    <span class="badge-dot"></span>
                    {{ formatStatus(task.status) }}
                  </span>
                </div>
                @if (task.description) {
                  <p class="task-desc">{{ task.description }}</p>
                }
                <div class="task-footer">
                  <span class="task-date">
                    <mat-icon>schedule</mat-icon>
                    {{ task.createdAt | date:'MMM d, y' }}
                  </span>
                </div>
              </div>
              <div class="task-actions">
                <a [routerLink]="['/tasks/edit', task.id]" class="action-btn edit" title="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <button class="action-btn delete" (click)="confirmDelete(task)" title="Delete">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      }

    </div>
  `,
  styles: [`
    /* ── Shell ── */
    .list-shell {
      min-height: 100vh;
      background: #0d1117;
      padding: 36px 28px 72px;
      font-family: 'DM Sans', 'Segoe UI', sans-serif;
      color: #e2e8f0;
      max-width: 860px;
      margin: 0 auto;
    }

    /* ── Top bar ── */
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .page-title {
      margin: 0 0 4px;
      font-size: 28px;
      font-weight: 700;
      color: #f1f5f9;
      font-family: 'Sora', 'DM Sans', sans-serif;
      letter-spacing: -0.5px;
    }
    .page-sub { margin: 0; font-size: 13px; color: #475569; }
    .btn-new {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0d1117;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      border-radius: 10px;
      box-shadow: 0 4px 18px rgba(245,158,11,0.3);
      transition: opacity .2s, transform .15s;
    }
    .btn-new:hover { opacity: .9; transform: translateY(-1px); }
    .btn-new mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* ── Stats row ── */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 28px;
    }
    .stat-card {
      background: rgba(22,27,39,0.85);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px;
      padding: 18px 20px;
      text-align: left;
      cursor: pointer;
      transition: all .2s;
      font-family: inherit;
    }
    .stat-card:hover { border-color: rgba(255,255,255,0.14); transform: translateY(-2px); }
    .stat-card.active { box-shadow: inset 0 0 0 1.5px currentColor; }
    .stat-card[data-status=""].active,
    .stat-card[data-status=""]:hover { color: #f59e0b; border-color: rgba(245,158,11,.35); }
    .stat-card[data-status="TO_DO"].active        { color: #93c5fd; border-color: rgba(59,130,246,.4); }
    .stat-card[data-status="IN_PROGRESS"].active  { color: #fcd34d; border-color: rgba(245,158,11,.4); }
    .stat-card[data-status="DONE"].active         { color: #6ee7b7; border-color: rgba(16,185,129,.4); }
    .stat-count {
      display: block;
      font-size: 26px;
      font-weight: 700;
      color: inherit;
      line-height: 1;
      margin-bottom: 4px;
      font-family: 'Sora', sans-serif;
    }
    .stat-card:not(.active) .stat-count { color: #e2e8f0; }
    .stat-label { font-size: 12px; color: #64748b; font-weight: 500; }

    /* ── Spinner ── */
    .spinner-wrap {
      display: flex;
      justify-content: center;
      padding: 80px;
    }
    .spinner-wrap mat-spinner { --mdc-circular-progress-active-indicator-color: #f59e0b; }

    /* ── Empty ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 80px 24px;
      text-align: center;
    }
    .empty-icon-wrap {
      width: 64px; height: 64px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
    }
    .empty-icon-wrap mat-icon { font-size: 28px; width: 28px; height: 28px; color: #334155; }
    .empty-title { margin: 0 0 6px; font-size: 17px; font-weight: 600; color: #475569; }
    .empty-sub { margin: 0; font-size: 13.5px; color: #334155; }

    /* ── Task list ── */
    .task-list { display: flex; flex-direction: column; gap: 8px; }

    .task-row {
      display: flex;
      align-items: stretch;
      background: rgba(22,27,39,0.85);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px;
      overflow: hidden;
      transition: border-color .2s, transform .15s, box-shadow .2s;
      animation: rowIn .35s cubic-bezier(.16,1,.3,1) both;
    }
    .task-row:hover {
      border-color: rgba(255,255,255,0.14);
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    }
    @keyframes rowIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Coloured left bar */
    .task-status-bar { width: 4px; flex-shrink: 0; background: #1e2538; }
    .task-row[data-status="TO_DO"]        .task-status-bar { background: linear-gradient(180deg, #3b82f6, #1d4ed8); }
    .task-row[data-status="IN_PROGRESS"]  .task-status-bar { background: linear-gradient(180deg, #f59e0b, #d97706); }
    .task-row[data-status="DONE"]         .task-status-bar { background: linear-gradient(180deg, #10b981, #059669); }

    .task-body { flex: 1; padding: 16px 18px; min-width: 0; }
    .task-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 4px;
    }
    .task-title {
      font-size: 15px;
      font-weight: 600;
      color: #e2e8f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .task-desc {
      margin: 6px 0 10px;
      font-size: 13.5px;
      color: #475569;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.5;
    }
    .task-footer {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .task-date {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #334155;
    }
    .task-date mat-icon { font-size: 13px; width: 13px; height: 13px; }

    /* ── Status badge ── */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 11px;
      border-radius: 20px;
      font-size: 11.5px;
      font-weight: 600;
      flex-shrink: 0;
    }
    .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    .status-badge[data-status="TO_DO"]        { background: rgba(59,130,246,0.12);  color: #93c5fd; }
    .status-badge[data-status="IN_PROGRESS"]  { background: rgba(245,158,11,0.12);  color: #fcd34d; }
    .status-badge[data-status="DONE"]         { background: rgba(16,185,129,0.12);  color: #6ee7b7; }

    /* ── Row actions ── */
    .task-actions {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
      padding: 8px 10px;
      border-left: 1px solid rgba(255,255,255,0.05);
    }
    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px; height: 34px;
      border-radius: 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: #475569;
      text-decoration: none;
      transition: background .2s, color .2s;
    }
    .action-btn mat-icon { font-size: 17px; width: 17px; height: 17px; }
    .action-btn.edit:hover  { background: rgba(59,130,246,0.12); color: #93c5fd; }
    .action-btn.delete:hover { background: rgba(239,68,68,0.12); color: #fca5a5; }
  `]
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  tasks: Task[] = [];
  allTasks: Task[] = [];
  loading = false;
  selectedStatus = '';

  get stats() {
    return [
      { status: '',            label: 'All',         count: this.allTasks.length },
      { status: 'TO_DO',       label: 'To Do',       count: this.allTasks.filter(t => t.status === 'TO_DO').length },
      { status: 'IN_PROGRESS', label: 'In Progress', count: this.allTasks.filter(t => t.status === 'IN_PROGRESS').length },
      { status: 'DONE',        label: 'Done',        count: this.allTasks.filter(t => t.status === 'DONE').length },
    ];
  }

  ngOnInit() { this.loadTasks(); }

  loadTasks() {
    this.loading = true;
    this.taskService.getAll().subscribe({
      next: tasks => {
        this.allTasks = tasks;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load tasks', '✕', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  setFilter(status: string) {
    this.selectedStatus = this.selectedStatus === status ? '' : status;
    this.applyFilter();
  }

  private applyFilter() {
    this.tasks = this.selectedStatus
      ? this.allTasks.filter(t => t.status === this.selectedStatus)
      : [...this.allTasks];
  }

  formatStatus(s: TaskStatus): string {
    return { TO_DO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }[s] ?? s;
  }

  confirmDelete(task: Task) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Delete "${task.title}"?` }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) this.deleteTask(task.id!);
    });
  }

  private deleteTask(id: number) {
    this.taskService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Task deleted', '✕', { duration: 2500 });
        this.loadTasks();
      },
      error: () => this.snackBar.open('Delete failed', '✕', { duration: 3000 })
    });
  }
}