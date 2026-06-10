import { z } from "zod";

// ============================================
// CONSTANTS
// ============================================

const EMAIL_MAX_LENGTH = 254; // RFC 5321
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

// ============================================
// ERROR MESSAGES
// ============================================

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
  },
};

// ============================================
// COMMON PASSWORD DENY-LIST (top 25 most used)
// ============================================

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

// ============================================
// REGEX PATTERNS
// ============================================

const patterns = {
  email:
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/,
  spaces: /\s/,
};

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string[];
  password?: string[];
}

// ============================================
// ASYNC EMAIL VALIDATOR
// ============================================

/**
 * Checks if an email is available (not already registered).
 * Replace this with your actual API call.
 */
async function checkEmailAvailability(email: string): Promise<boolean> {
  // Simulated API call — replace with real fetch/axios
  const response = await fetch("/api/auth/check-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Email availability check failed");
  }

  const data = await response.json();
  // API returns { available: true } or { available: false }
  return data.available;
}

/**
 * Creates a debounced version of checkEmailAvailability to avoid
 * excessive API calls during typing.
 */
export function createEmailValidator(debounceMs = 300) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingEmail: string | null = null;
  let pendingResolve: ((value: boolean) => void) | null = null;
  let lastResult: { email: string; available: boolean } | null = null;

  return async (email: string): Promise<boolean> => {
    // Return cached result immediately if the email hasn't changed
    if (lastResult && lastResult.email === email) {
      return lastResult.available;
    }

    // Clear any pending timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Return a promise that resolves after the debounce
    return new Promise((resolve) => {
      pendingEmail = email;
      pendingResolve = resolve;

      timeoutId = setTimeout(async () => {
        try {
          const available = await checkEmailAvailability(email);
          lastResult = { email, available };
          pendingResolve?.(available);
        } catch {
          // Let Zod handle the error via refinement
          pendingResolve?.(false);
        }
        timeoutId = null;
        pendingEmail = null;
        pendingResolve = null;
      }, debounceMs);
    });
  };
}

// ============================================
// BASE SCHEMA (without async refinements)
// ============================================

/**
 * Synchronous password validation rules.
 * Extracted for reuse in registration, reset password, etc.
 */
export const passwordValidation = z
  .string({ required_error: messages.password.required })
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

/**
 * Synchronous email validation rules.
 */
const emailValidation = z
  .string({ required_error: messages.email.required })
  .trim()
  .toLowerCase()
  .min(1, messages.email.required)
  .max(EMAIL_MAX_LENGTH, messages.email.maxLength)
  .email(messages.email.invalid)
  .regex(patterns.email, messages.email.invalid);

// ============================================
// LOGIN SCHEMA
// ============================================

/**
 * Schema for login form validation.
 *
 * Usage (client-side, no async check):
 *   const result = loginSchema.safeParse(formData)
 *
 * Usage (with async email check):
 *   const result = await loginSchemaAsync.safeParseAsync(formData)
 */
export const loginSchema = z.object({
  email: emailValidation,
  password: passwordValidation,
});

// ============================================
// LOGIN SCHEMA WITH ASYNC EMAIL CHECK
// ============================================

/**
 * Async schema that validates email format AND checks availability via API.
 * Use this when you want real-time email validation against your backend.
 *
 * Usage:
 *   const result = await loginSchemaAsync.safeParseAsync(formData)
 *
 * For best UX, use `createEmailValidator()` with debouncing in your component.
 */
export const loginSchemaAsync = z.object({
  email: emailValidation.refine(
    async (email) => {
      try {
        const available = await checkEmailAvailability(email);
        return available;
      } catch {
        // If the API fails, we don't block the user — validation passes
        // with a warning instead. Adjust based on your UX requirements.
        return true;
      }
    },
    { message: messages.email.unavailable },
  ),
  password: passwordValidation,
});

// ============================================
// HELPER: CREATE DEBOUNCED VALIDATOR
// ============================================

/**
 * Creates a debounced async validation function suitable for
 * real-time form validation with vee-validate, FormKit, or custom forms.
 *
 * Usage:
 *   const validateEmail = createDebouncedEmailValidator()
 *   // In your component on @input:
 *   const result = await validateEmail(email)
 */
export function createDebouncedEmailValidator(debounceMs = 300) {
  const checkAvailability = createEmailValidator(debounceMs);

  return async (email: string) => {
    // First, run sync validation
    const syncResult = emailValidation.safeParse(email);

    if (!syncResult.success) {
      return {
        valid: false,
        errors: syncResult.error.errors.map((e) => e.message),
      };
    }

    // Then, check availability
    try {
      const available = await checkAvailability(email);
      if (!available) {
        return {
          valid: false,
          errors: [messages.email.unavailable],
        };
      }
    } catch {
      return {
        valid: false,
        errors: [messages.email.checkFailed],
      };
    }

    return { valid: true, errors: [] };
  };
}

// ============================================
// HELPER: PARSE AND FORMAT ERRORS
// ============================================

/**
 * Parses Zod validation errors into a flat key-value format
 * suitable for form error display.
 *
 * Usage:
 *   const result = loginSchema.safeParse(data)
 *   if (!result.success) {
 *     const fieldErrors = formatZodErrors(result.error)
 *     // { email: ['Invalid email'], password: ['Too short'] }
 *   }
 */
export function formatZodErrors(error: z.ZodError): LoginFormErrors {
  const formatted: LoginFormErrors = {};

  for (const issue of error.issues) {
    const path = issue.path[0] as string;
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path]!.push(issue.message);
  }

  return formatted;
}

// ============================================
// TYPE INFERENCE
// ============================================

export type LoginSchema = z.infer<typeof loginSchema>;
export type LoginSchemaAsync = z.infer<typeof loginSchemaAsync>;
