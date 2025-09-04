import type { CreateUserPayload, UpdateUserPayload, User } from "../types/user";
import { API_URL } from "./config";

const fetchUsers = async (
  token: string,
  filters?: { role?: string; name?: string; email?: string }
): Promise<User[]> => {
  const params = new URLSearchParams();
  if (filters?.role) params.set("role", filters.role);
  if (filters?.name) params.set("name", filters.name);
  if (filters?.email) params.set("email", filters.email);
  const url = `${API_URL}/users${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  const response = await fetch(url, {
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
    throw new Error(errorData.message || "Falha ao buscar usuários");
  }

  return response.json() as Promise<User[]>;
};

const fetchUserById = async (token: string, id: number): Promise<User> => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao buscar usuário");
  }

  return response.json() as Promise<User>;
};

const createUser = async (
  token: string,
  payload: CreateUserPayload
): Promise<User> => {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao criar usuário");
  }

  return response.json() as Promise<User>;
};

const updateUser = async (
  token: string,
  id: number,
  payload: UpdateUserPayload
): Promise<User> => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao atualizar usuário");
  }

  return response.json() as Promise<User>;
};

const deleteUser = async (token: string, id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao remover usuário");
  }
};

export { fetchUsers, fetchUserById, createUser, updateUser, deleteUser };
