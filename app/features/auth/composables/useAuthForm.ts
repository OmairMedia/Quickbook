import { reactive, computed, type Ref } from "vue";
import type { ZodSchema, ZodError } from "zod";
import { useAuthStore } from "~/features/auth/stores/auth.store";

export interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function usePasswordRequirements(password: Ref<string>) {
  return computed<PasswordRequirement[]>(() => [
    { label: "At least 8 characters", met: password.value.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password.value) },
    { label: "One lowercase letter", met: /[a-z]/.test(password.value) },
    { label: "One number", met: /[0-9]/.test(password.value) },
    {
      label: "One special character",
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password.value),
    },
    { label: "No spaces", met: !/\s/.test(password.value) },
  ]);
}

export type FormErrors = Record<string, string[]>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAuthForm<T extends Record<string, any>>(
  schema: ZodSchema<T>,
  initialForm: T,
  formFields: (keyof T)[],
) {
  const store = useAuthStore();

  const form = reactive({ ...initialForm }) as T;
  const errors = reactive(
    Object.fromEntries(formFields.map((f) => [f, []])) as FormErrors,
  );

  const formError = computed(() => store.error);
  const loading = computed(() => store.loading);

  function setFieldError(field: keyof T, messages: string[]) {
    errors[field as string] = messages;
  }

  function parseErrors(result: { success: boolean; error?: ZodError<T> }) {
    if (!result.success) {
      for (const field of formFields) {
        setFieldError(
          field,
          result
            .error!.issues.filter((i) => i.path[0] === field)
            .map((e) => e.message),
        );
      }
      return false;
    }
    for (const field of formFields) {
      setFieldError(field, []);
    }
    return true;
  }

  function validateField(field: keyof T) {
    const result = schema.safeParse(form);
    if (!result.success) {
      setFieldError(
        field,
        result.error.issues
          .filter((i) => i.path[0] === field)
          .map((e) => e.message),
      );
    } else {
      setFieldError(field, []);
    }
  }

  function validateAll(): boolean {
    return parseErrors(schema.safeParse(form));
  }

  function clearErrors() {
    for (const field of formFields) {
      setFieldError(field, []);
    }
  }

  return {
    form,
    errors,
    formError,
    loading,
    validateField,
    validateAll,
    clearErrors,
    store,
  };
}
