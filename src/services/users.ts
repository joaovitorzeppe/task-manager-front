import type { User } from "../types/user";
import { API_URL } from "./config";

type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: User["role"];
};

type UpdateUserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: User["role"];
};

const fetchUsers = async (token: string): Promise<User[]> => {
  const response = await fetch(`${API_URL}/users`, {
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
export type { CreateUserPayload, UpdateUserPayload };
