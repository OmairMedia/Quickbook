export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SessionResponse {
  user: User;
  expiresAt: number;
}

export interface EmailCheckResponse {
  available: boolean;
}

export interface ApiError {
  statusCode: number;
  statusMessage: string;
  data?: Record<string, unknown>;
}

export interface AuthError {
  message: string;
  code:
    | "INVALID_CREDENTIALS"
    | "EMAIL_NOT_VERIFIED"
    | "SESSION_EXPIRED"
    | "RATE_LIMITED"
    | "NETWORK_ERROR"
    | "EMAIL_EXISTS"
    | "UNKNOWN";
  statusCode: number;
}

export interface PasswordRequirement {
  label: string;
  met: boolean;
}

export type Permission =
  | "users:read"
  | "users:write"
  | "users:delete"
  | "settings:read"
  | "settings:write"
  | "billing:read"
  | "billing:write"
  | "analytics:read"
  | "projects:read"
  | "projects:write"
  | "projects:delete"
  | "team:read"
  | "team:write"
  | "admin:access";

export interface AuthMiddlewareOptions {
  required?: boolean;
  permissions?: Permission[];
  redirectTo?: string;
  guestOnly?: boolean;
}

export type AuthPage =
  | "/auth/login"
  | "/auth/register"
  | "/auth/forgot-password"
  | "/auth/reset-password";
