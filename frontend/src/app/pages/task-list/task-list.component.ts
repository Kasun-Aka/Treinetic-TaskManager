import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
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
    MatTableModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatChipsModule,
    MatCardModule, MatProgressSpinnerModule, MatSnackBarModule, MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="list-header">
        <h1>My Tasks</h1>
        <button mat-raised-button color="primary" routerLink="/tasks/new">
          <mat-icon>add</mat-icon> New Task
        </button>
      </div>

      <!-- Status filter -->
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Filter by status</mat-label>
        <mat-select [(ngModel)]="selectedStatus" (selectionChange)="loadTasks()">
          <mat-option value="">All</mat-option>
          <mat-option value="TO_DO">To Do</mat-option>
          <mat-option value="IN_PROGRESS">In Progress</mat-option>
          <mat-option value="DONE">Done</mat-option>
        </mat-select>
      </mat-form-field>

      @if (loading) {
        <div class="spinner-wrap"><mat-spinner /></div>
      } @else if (tasks.length === 0) {
        <mat-card class="empty-card">
          <mat-icon>inbox</mat-icon>
          <p>No tasks found. Create your first one!</p>
        </mat-card>
      } @else {
        <mat-card>
          <table mat-table [dataSource]="tasks" class="task-table">

            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let t">{{ t.title }}</td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let t" class="desc-cell">{{ t.description || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let t">
                <span class="status-chip" [class]="'status-' + t.status">
                  {{ formatStatus(t.status) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>Created</th>
              <td mat-cell *matCellDef="let t">{{ t.createdAt | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let t">
                <button mat-icon-button color="primary" [routerLink]="['/tasks/edit', t.id]" title="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="confirmDelete(t)" title="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    h1 { font-size: 26px; font-weight: 500; }
    .filter-field { width: 220px; margin-bottom: 16px; }
    .task-table { width: 100%; }
    .desc-cell { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .spinner-wrap { display: flex; justify-content: center; padding: 60px; }
    .empty-card {
      display: flex; flex-direction: column;
      align-items: center; padding: 48px;
      color: #9e9e9e; gap: 12px;
    }
    .empty-card mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .status-chip {
      padding: 4px 12px; border-radius: 12px;
      font-size: 12px; font-weight: 500;
    }
    .status-TO_DO    { background: #e3f2fd; color: #1565c0; }
    .status-IN_PROGRESS { background: #fff3e0; color: #e65100; }
    .status-DONE     { background: #e8f5e9; color: #2e7d32; }
  `]
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  tasks: Task[] = [];
  loading = false;
  selectedStatus = '';
  columns = ['title', 'description', 'status', 'createdAt', 'actions'];

  ngOnInit() { this.loadTasks(); }

  loadTasks() {
    this.loading = true;
    this.taskService.getAll(this.selectedStatus || undefined).subscribe({
      next: tasks => { this.tasks = tasks; this.loading = false; },
      error: () => { this.snackBar.open('Failed to load tasks', 'Close', { duration: 3000 }); this.loading = false; }
    });
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
        this.snackBar.open('Task deleted', 'Close', { duration: 2500 });
        this.loadTasks();
      },
      error: () => this.snackBar.open('Delete failed', 'Close', { duration: 3000 })
    });
  }
}
