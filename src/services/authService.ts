import axios from "axios";
import type { LoginCredentials, LoginResponse } from "../types/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", credentials);
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
