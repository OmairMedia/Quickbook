import type {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AuthResponse,
  SessionResponse,
  EmailCheckResponse,
} from "../types/auth";

export const authApi = {
  login(payload: LoginPayload) {
    return $fetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: payload,
    });
  },

  register(payload: RegisterPayload) {
    return $fetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  logout() {
    return $fetch<{ success: boolean }>("/api/auth/logout", {
      method: "POST",
    });
  },

  refreshSession() {
    return $fetch<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }>("/api/auth/refresh", {
      method: "POST",
    });
  },

  getSession() {
    return $fetch<SessionResponse>("/api/auth/session");
  },

  checkEmailAvailability(email: string) {
    return $fetch<EmailCheckResponse>("/api/auth/check-email-availability", {
      method: "POST",
      body: { email },
    });
  },

  forgotPassword(payload: ForgotPasswordPayload) {
    return $fetch<{ success: boolean }>("/api/auth/forgot-password", {
      method: "POST",
      body: payload,
    });
  },

  resetPassword(payload: ResetPasswordPayload) {
    return $fetch<{ success: boolean }>("/api/auth/reset-password", {
      method: "POST",
      body: payload,
    });
  },
};
