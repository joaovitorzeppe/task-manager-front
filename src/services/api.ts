import type { LoginDto, LoginResponse } from "../types/auth";
import type { User } from "../types/user";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const loginUser = async (credentials: LoginDto): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Falha ao fazer login");
  }

  return response.json() as Promise<LoginResponse>;
};

const fetchUsers = async (token: string): Promise<User[]> => {
  const response = await fetch(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Falha ao buscar usuários");
  }

  return response.json() as Promise<User[]>;
};

export { fetchUsers, loginUser };
