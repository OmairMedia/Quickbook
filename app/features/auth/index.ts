export { useAuthStore } from "./stores/auth.store";
export { useAuth } from "./composables/useAuth";
export { useAuthSession } from "./composables/useAuthSession";
export {
  useAuthForm,
  usePasswordRequirements,
} from "./composables/useAuthForm";
export { authApi } from "./api/auth.api";
export {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  checkEmailSchema,
  passwordValidation,
} from "./schemas/auth.schema";
export type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  CheckEmailInput,
} from "./schemas/auth.schema";
export type {
  User,
  UserRole,
  AuthSession,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AuthResponse,
  SessionResponse,
  EmailCheckResponse,
  ApiError,
  AuthError,
  PasswordRequirement,
  Permission,
  AuthMiddlewareOptions,
  AuthPage,
} from "./types/auth";
