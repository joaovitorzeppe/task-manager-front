import type { Task } from "../types/task";
import { API_URL } from "./config";

const fetchTasks = async (token: string): Promise<Task[]> => {
  const response = await fetch(`${API_URL}/tasks`, {
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

export { fetchTasks };
