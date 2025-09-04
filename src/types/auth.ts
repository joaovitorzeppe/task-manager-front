import type { User } from "./user";

export type LoginDto = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
};
