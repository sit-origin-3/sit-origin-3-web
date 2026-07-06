import axios from "axios";
import type { UserProfile } from "../types/user";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export async function getMe(): Promise<{
  user: UserProfile;
  token: string | null;
}> {
  const response = await api.get<UserProfile>("/users/me");

  let token = null;
  const authHeader =
    response.headers["authorization"] || response.headers["x-access-token"];
  if (typeof authHeader === "string") {
    token = authHeader.replace(/^Bearer\s+/i, "");
  }

  console.log(response.data);
  return { user: response.data, token };
}
