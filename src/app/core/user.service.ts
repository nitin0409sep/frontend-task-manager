import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginatedResponse } from '../models/pagination.model';
import { User } from '../models/user.model';

export type UserListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(options: UserListParams = {}): Observable<PaginatedResponse<User>> {
    let params = new HttpParams()
      .set('page', String(options.page || 1))
      .set('limit', String(options.limit || 100));

    if (options.search?.trim()) {
      params = params.set('search', options.search.trim());
    }

    return this.http.get<PaginatedResponse<User>>(`${environment.apiUrl}/users`, { params });
  }

  assignTeamLead(employeeId: string, teamLeadId: string): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users/${employeeId}/team-lead`, { teamLeadId });
  }
}
