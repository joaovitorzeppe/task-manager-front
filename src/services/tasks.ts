import type {
  CreateTaskPayload,
  UpdateTaskPayload,
  Task,
  TaskComment,
} from "../types/task";
import { API_URL } from "./config";

const fetchTasks = async (
  token: string,
  filters?: Partial<{
    projectId: number;
    status: Task["status"];
    assigneeId: number;
    title: string;
    priority: Task["priority"];
    dueDateFrom: string;
    dueDateTo: string;
  }>
): Promise<Task[]> => {
  const query = new URLSearchParams();
  if (filters?.projectId) query.set("projectId", String(filters.projectId));
  if (filters?.status) query.set("status", filters.status);
  if (filters?.assigneeId) query.set("assigneeId", String(filters.assigneeId));
  if (filters?.title) query.set("title", filters.title);
  if (filters?.priority) query.set("priority", filters.priority);
  if (filters?.dueDateFrom) query.set("dueDateFrom", filters.dueDateFrom);
  if (filters?.dueDateTo) query.set("dueDateTo", filters.dueDateTo);
  const qs = query.toString();
  const response = await fetch(`${API_URL}/tasks${qs ? `?${qs}` : ""}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "/login";
      return [];
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao buscar tarefas");
  }

  return response.json() as Promise<Task[]>;
};

const fetchTaskById = async (token: string, id: number): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao buscar tarefa");
  }
  return response.json() as Promise<Task>;
};

const createTask = async (
  token: string,
  payload: CreateTaskPayload
): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao criar tarefa");
  }
  return response.json() as Promise<Task>;
};

const updateTask = async (
  token: string,
  id: number,
  payload: UpdateTaskPayload
): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao atualizar tarefa");
  }
  return response.json() as Promise<Task>;
};

const deleteTask = async (token: string, id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao remover tarefa");
  }
};

const fetchTaskComments = async (
  token: string,
  id: number
): Promise<TaskComment[]> => {
  const response = await fetch(`${API_URL}/tasks/${id}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao buscar comentários");
  }
  return response.json() as Promise<TaskComment[]>;
};

const createTaskComment = async (
  token: string,
  id: number,
  content: string
): Promise<TaskComment> => {
  const response = await fetch(`${API_URL}/tasks/${id}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao criar comentário");
  }
  return response.json() as Promise<TaskComment>;
};

export {
  fetchTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  fetchTaskComments,
  createTaskComment,
};
