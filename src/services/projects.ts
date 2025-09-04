import type {
  CreateProjectPayload,
  UpdateProjectPayload,
  Project,
} from "../types/project";
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

const fetchProjectById = async (
  token: string,
  id: number
): Promise<Project> => {
  const response = await fetch(`${API_URL}/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao buscar projeto");
  }
  return response.json() as Promise<Project>;
};

const createProject = async (
  token: string,
  payload: CreateProjectPayload
): Promise<Project> => {
  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao criar projeto");
  }
  return response.json() as Promise<Project>;
};

const updateProject = async (
  token: string,
  id: number,
  payload: UpdateProjectPayload
): Promise<Project> => {
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao atualizar projeto");
  }
  return response.json() as Promise<Project>;
};

const deleteProject = async (token: string, id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao remover projeto");
  }
};

export {
  fetchProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
};
