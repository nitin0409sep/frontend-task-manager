export type UserRole = 'Manager' | 'Team Lead' | 'Employee';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
  teamLead?: string | User | null;
}

export interface AuthResponse {
  user: User;
  token: string;
  accessToken: string;
  refreshToken: string;
}
