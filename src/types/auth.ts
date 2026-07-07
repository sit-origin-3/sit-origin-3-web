import type { UserProfile } from "./user";

export type UserRole = "ADMIN" | "STAFF" | "FRESHY";
export type User = UserProfile;

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}
