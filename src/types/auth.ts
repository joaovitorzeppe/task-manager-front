export type LoginDto = {
  email: string;
  password: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
};
