import { useAuthStore } from "../stores/auth.store";
import { useAuthSession } from "./useAuthSession";
import type {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "../types/auth";

export function useAuth() {
  const store = useAuthStore();
  const userSession = useAuthSession();

  const user = computed(() => store.user ?? userSession.user.value ?? null);
  const isAuthenticated = computed(() => !!user.value);
  const loading = computed(() => store.loading);
  const error = computed(() => store.error);

  async function login(payload: LoginPayload) {
    await store.login(payload);
    await userSession.fetch();
    await navigateTo("/app/notes");
  }

  async function register(payload: RegisterPayload) {
    await store.register(payload);
    await userSession.fetch();
    await navigateTo("/app/notes");
  }

  async function logout() {
    await store.logout();
    await userSession.clearSession();
    await navigateTo("/auth/login");
  }

  async function fetchSession() {
    await store.fetchSession();
    if (!store.user) {
      await userSession.fetch();
    }
  }

  async function refreshSession() {
    await userSession.fetch();
  }

  async function forgotPassword(payload: ForgotPasswordPayload) {
    await store.forgotPassword(payload);
  }

  async function resetPassword(payload: ResetPasswordPayload) {
    await store.resetPassword(payload);
    await navigateTo("/auth/login");
  }

  async function checkEmailAvailability(email: string) {
    return store.checkEmailAvailability(email);
  }

  function clearError() {
    store.clearError();
  }

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    fetchSession,
    refreshSession,
    forgotPassword,
    resetPassword,
    checkEmailAvailability,
    clearError,
  };
}
