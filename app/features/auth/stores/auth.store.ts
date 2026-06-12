import { defineStore } from "pinia";
import { authApi } from "../api/auth.api";
import type {
  User,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AuthResponse,
  EmailCheckResponse,
} from "../types/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async login(payload: LoginPayload): Promise<AuthResponse> {
      this.loading = true;
      this.error = null;

      try {
        const response = await authApi.login(payload);
        this.user = response.user;
        return response;
      } catch (err: any) {
        const message =
          err?.data?.code === "INVALID_CREDENTIALS"
            ? "Invalid email or password"
            : "An error occurred during login. Please try again.";
        this.error = message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async register(payload: RegisterPayload): Promise<AuthResponse> {
      this.loading = true;
      this.error = null;

      try {
        const response = await authApi.register(payload);
        this.user = response.user;
        return response;
      } catch (err: any) {
        const message =
          err?.data?.code === "EMAIL_EXISTS"
            ? "This email is already registered"
            : "An error occurred during registration. Please try again.";
        this.error = message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async logout(): Promise<void> {
      this.loading = true;

      try {
        await authApi.logout();
        this.user = null;
        this.error = null;
      } catch {
        this.user = null;
        this.error = null;
      } finally {
        this.loading = false;
      }
    },

    async fetchSession(): Promise<void> {
      try {
        const response = await authApi.getSession();
        this.user = response.user;
      } catch {
        this.user = null;
      }
    },

    async refreshSession(): Promise<void> {
      try {
        await authApi.refreshSession();
        await this.fetchSession();
      } catch {
        this.user = null;
      }
    },

    async checkEmailAvailability(email: string): Promise<EmailCheckResponse> {
      return authApi.checkEmailAvailability(email);
    },

    async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        await authApi.forgotPassword(payload);
      } catch (err: any) {
        this.error =
          err?.statusMessage ?? "An error occurred. Please try again.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async resetPassword(payload: ResetPasswordPayload): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        await authApi.resetPassword(payload);
      } catch (err: any) {
        this.error =
          err?.statusMessage ?? "An error occurred. Please try again.";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    clearError(): void {
      this.error = null;
    },

    setUser(user: User | null): void {
      this.user = user;
    },
  },
});
