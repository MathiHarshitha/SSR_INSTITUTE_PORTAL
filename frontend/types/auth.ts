export type Role = "ADMIN" | "TRAINER" | "STUDENT";

export type UserStatus = "PENDING" | "ACTIVE" | "REJECTED" | "BLOCKED" | "SUSPENDED";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  phone?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  profile?: Record<string, unknown> | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: unknown[];
}
