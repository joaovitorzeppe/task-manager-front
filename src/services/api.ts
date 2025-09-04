import type { LoginDto, LoginResponse } from "../types/auth";

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

export { loginUser };
