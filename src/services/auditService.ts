import { api } from "../utils/api";

export interface AuditActor {
  id: number;
  firstname: string;
  lastname: string;
  nickname: string;
  userCode: string;
  role: string;
}

export interface AuditLog {
  id: number;
  action: string;
  status: string;
  metadata: Record<string, any>;
  createdAt: string;
  actor: AuditActor;
  target?: AuditActor;
}

export interface AuditResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export async function getAudits(params: {
  page: number;
  limit: number;
  action?: string;
}): Promise<AuditResponse> {
  const { data } = await api.get<AuditResponse>("/audits", {
    params,
  });
  return data;
}
