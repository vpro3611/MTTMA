export interface User {
  id: string;
  email: string;
  status: string;
  created_at: string;
  password?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ChangePassInput {
  old_pass: string;
  new_pass: string;
}

export interface ChangeEmailInput {
  new_email: string;
}
