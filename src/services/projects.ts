import type { Project } from "../types/project";
import { API_URL } from "./config";

const fetchProjects = async (token: string): Promise<Project[]> => {
  const response = await fetch(`${API_URL}/projects`, {
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
    throw new Error(errorData.message || "Falha ao buscar projetos");
  }

  return response.json() as Promise<Project[]>;
};

export { fetchProjects };
