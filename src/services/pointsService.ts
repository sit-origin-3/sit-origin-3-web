import axios from "axios";
import { getMe } from "./userService";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export interface ReceiverProfile {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  nickname: string;
  userCode: string;
  role: "ADMIN" | "STAFF" | "FRESHY";
  points: number;
  group: string;
}

export interface GivePointsPayload {
  receiverCode: string;
  amount: number;
}

export interface GivePointsResponse {
  success: boolean;
  receiverCode: string;
  amount: number;
}

export async function getUserByCode(code: string): Promise<ReceiverProfile> {
  const { data } = await api.get<ReceiverProfile>(`/users/code/${code}`);
  return data;
}

export async function givePoints(
  payload: GivePointsPayload,
): Promise<GivePointsResponse> {
  const { token } = await getMe();

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const { data } = await api.post<GivePointsResponse>(
    "/points/give",
    payload,
    { headers },
  );
  return data;
}
