import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./pages/task-list/task-list.component').then(m => m.TaskListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tasks/new',
    loadComponent: () => import('./pages/task-form/task-form.component').then(m => m.TaskFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tasks/edit/:id',
    loadComponent: () => import('./pages/task-form/task-form.component').then(m => m.TaskFormComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'tasks' }
];
