import type { User } from "./user";

export type Project = {
  id: number;
  name: string;
  description?: string | null;
  status: "planned" | "active" | "completed" | "cancelled";
  startDate: string;
  endDate?: string | null;
  managerId: number;
  manager?: User;
};

export type CreateProjectPayload = {
  name: string;
  description?: string | null;
  status: Project["status"];
  startDate: string;
  endDate?: string | null;
  managerId: number;
};

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export const statuses = {
  planned: "Planejado",
  active: "Ativo",
  completed: "Completo",
  cancelled: "Cancelado",
} as const;
