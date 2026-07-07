import { api } from "../utils/api";

export interface SystemConfig {
  key: string;
  value: string;
}

export async function getConfigs(): Promise<SystemConfig[]> {
  const { data } = await api.get<SystemConfig[]>("/configs");
  return data;
}

export async function updateConfig(key: string, value: string): Promise<SystemConfig> {
  const { data } = await api.patch<SystemConfig>(`/configs/${key}`, { value });
  return data;
}
