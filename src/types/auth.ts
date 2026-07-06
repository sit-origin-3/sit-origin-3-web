export type UserRole = "admin" | "staff" | "freshy";

export interface User {
  id: string;
  studentId: string;
  displayName: string;
  role: UserRole;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}
