import type { Project } from "./project";
import type { User } from "./user";

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  dueDate?: string | null;
  projectId: number;
  assigneeId?: number;
  project?: Project;
  assignee?: User;
  comments?: TaskComment[];
};

export type CreateTaskPayload = {
  title: string;
  description?: string | null;
  status?: Task["status"];
  priority?: Task["priority"];
  dueDate?: string | null;
  projectId: number;
  assigneeId?: number;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export type TaskComment = {
  id: number;
  taskId: number;
  authorId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
};

export const statuses = {
  todo: "A Fazer",
  in_progress: "Em Progresso",
  review: "Revisão",
  done: "Concluída",
} as const;

export const priorities = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
} as const;
