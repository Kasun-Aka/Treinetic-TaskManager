import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Task } from '../../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/tasks`;

  getAll(status?: string) {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Task[]>(this.url, { params });
  }

  getById(id: number) {
    return this.http.get<Task>(`${this.url}/${id}`);
  }

  create(task: Task) {
    return this.http.post<Task>(this.url, task);
  }

  update(id: number, task: Task) {
    return this.http.put<Task>(`${this.url}/${id}`, task);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
