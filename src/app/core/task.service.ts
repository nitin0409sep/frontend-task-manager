import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginatedResponse } from '../models/pagination.model';
import { Task, TaskPayload, TaskStatus } from '../models/task.model';

export type TaskListParams = {
  status?: TaskStatus | 'all';
  page?: number;
  limit?: number;
  search?: string;
};

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private http: HttpClient) {}

  getTasks(options: TaskListParams = {}): Observable<PaginatedResponse<Task>> {
    let params = new HttpParams()
      .set('page', String(options.page || 1))
      .set('limit', String(options.limit || 10));

    if (options.status && options.status !== 'all') {
      params = params.set('status', options.status);
    }

    if (options.search?.trim()) {
      params = params.set('search', options.search.trim());
    }

    return this.http.get<PaginatedResponse<Task>>(`${environment.apiUrl}/tasks`, { params });
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${environment.apiUrl}/tasks/${id}`);
  }

  createTask(payload: TaskPayload): Observable<Task> {
    return this.http.post<Task>(`${environment.apiUrl}/tasks`, payload);
  }

  updateTask(id: string, payload: Partial<TaskPayload>): Observable<Task> {
    return this.http.patch<Task>(`${environment.apiUrl}/tasks/${id}`, payload);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/tasks/${id}`);
  }
}
