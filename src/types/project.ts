import type { User } from "./user";

export type ProjectMemberInput = {
  userId: number;
  role: "viewer" | "contributor" | "maintainer";
};

export type Project = {
  id: number;
  name: string;
  description?: string | null;
  status: "planned" | "active" | "completed" | "cancelled";
  startDate: string;
  endDate?: string | null;
  managerId: number;
  manager?: User;
  members?: Array<{
    id: number;
    userId: number;
    role: ProjectMemberInput["role"];
    user?: User;
  }>;
};

export type CreateProjectPayload = {
  name: string;
  description?: string | null;
  status: Project["status"];
  startDate: string;
  endDate?: string | null;
  managerId: number;
  members?: ProjectMemberInput[];
};

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export const statuses = {
  planned: "Planejado",
  active: "Ativo",
  completed: "Completo",
  cancelled: "Cancelado",
} as const;
