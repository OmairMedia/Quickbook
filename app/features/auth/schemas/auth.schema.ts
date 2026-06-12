import { z } from "zod";

const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const messages = {
  email: {
    required: "Email is required",
    invalid: "Please enter a valid email address",
    maxLength: `Email must not exceed ${EMAIL_MAX_LENGTH} characters`,
    unavailable: "This email is already registered",
    checkFailed: "Unable to verify email availability. Please try again.",
  },
  password: {
    required: "Password is required",
    minLength: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    maxLength: `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`,
    uppercase: "Password must contain at least one uppercase letter",
    lowercase: "Password must contain at least one lowercase letter",
    number: "Password must contain at least one number",
    symbol: "Password must contain at least one special character",
    common: "This password is too common. Please choose a stronger password.",
    noSpaces: "Password must not contain spaces",
    mismatch: "Passwords do not match",
  },
  name: {
    required: "Name is required",
    minLength: "Name must be at least 2 characters",
    maxLength: "Name must not exceed 100 characters",
  },
};

const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "12345678",
  "123456789",
  "qwerty123",
  "qwerty1",
  "abc12345",
  "admin123",
  "admin2024",
  "letmein1",
  "welcome1",
  "monkey12",
  "dragon12",
  "master12",
  "football",
  "baseball",
  "iloveyou",
  "trustno1",
  "sunshine",
  "princess",
  "shadow12",
  "1234qwer",
  "1q2w3e4r",
  "zaq12wsx",
]);

const patterns = {
  email:
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/,
  spaces: /\s/,
};

const emailValidation = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, messages.email.required)
  .max(EMAIL_MAX_LENGTH, messages.email.maxLength)
  .email(messages.email.invalid)
  .regex(patterns.email, messages.email.invalid);

export const passwordValidation = z
  .string()
  .min(PASSWORD_MIN_LENGTH, messages.password.minLength)
  .max(PASSWORD_MAX_LENGTH, messages.password.maxLength)
  .refine((val) => !patterns.spaces.test(val), messages.password.noSpaces)
  .refine((val) => patterns.uppercase.test(val), messages.password.uppercase)
  .refine((val) => patterns.lowercase.test(val), messages.password.lowercase)
  .refine((val) => patterns.number.test(val), messages.password.number)
  .refine((val) => patterns.symbol.test(val), messages.password.symbol)
  .refine(
    (val) => !COMMON_PASSWORDS.has(val.toLowerCase()),
    messages.password.common,
  );

export const loginSchema = z.object({
  email: emailValidation,
  password: z.string().min(1, messages.password.required),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, messages.name.minLength)
      .max(100, messages.name.maxLength),
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: z.string().min(1, messages.password.required),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: messages.password.mismatch,
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailValidation,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordValidation,
    confirmPassword: z.string().min(1, messages.password.required),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: messages.password.mismatch,
    path: ["confirmPassword"],
  });

export const checkEmailSchema = z.object({
  email: emailValidation,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CheckEmailInput = z.infer<typeof checkEmailSchema>;

export interface LoginFormErrors {
  email?: string[];
  password?: string[];
}

export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path[0] as string;
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path]!.push(issue.message);
  }
  return formatted;
}
