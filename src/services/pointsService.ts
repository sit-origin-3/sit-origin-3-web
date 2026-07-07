import axios from "axios";

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
  receiverCodes: string[];
  amount: number;
}

export interface GivePointsResponse {
  successful: number;
  failed: number;
  total: number;
}

export async function getUserByCode(code: string): Promise<ReceiverProfile> {
  const { data } = await api.get<ReceiverProfile>(`/users/code/${code}`);
  return data;
}

export async function givePoints(
  payload: GivePointsPayload,
): Promise<GivePointsResponse> {
  const { data } = await api.post<GivePointsResponse>("/points/give", payload);
  return data;
}

export interface AssignPointsPayload {
  userCode: string;
  amount: number;
}

export async function assignPoints(
  payload: AssignPointsPayload,
): Promise<any> {
  const { data } = await api.post("/points/assign", payload);
  return data;
}
