export type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "developer";
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: User["role"];
};

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  password?: string;
  role?: User["role"];
};

export const roles = {
  admin: "Administrador",
  manager: "Gerente",
  developer: "Desenvolvedor",
} as const;
