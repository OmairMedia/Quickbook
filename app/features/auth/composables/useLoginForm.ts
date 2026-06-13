import { reactive, computed } from "vue";
import { loginSchema } from "~/features/auth/schemas/auth.schema";
import { useAuthStore } from "~/features/auth/stores/auth.store";

export const useLoginForm = () => {
  const store = useAuthStore();
  const router = useRouter();

  const form = reactive({
    email: "",
    password: "",
    rememberMe: false,
  });

  interface FormErrors {
    email: string[];
    password: string[];
    rememberMe: string[];
  }

  const errors = reactive<FormErrors>({
    email: [],
    password: [],
    rememberMe: [],
  });

  const formError = computed(() => store.error);
  const loading = computed(() => store.loading);

  function validateField(field: keyof typeof errors) {
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = result.error.issues.filter(
        (i) => i.path[0] === field,
      );
      errors[field] = fieldErrors.map((e) => e.message);
    } else {
      errors[field] = [];
    }
  }

  function validateAll(): boolean {
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fields = ["email", "password", "rememberMe"] as const;
      for (const field of fields) {
        errors[field] = result.error.issues
          .filter((i) => i.path[0] === field)
          .map((e) => e.message);
      }
      return false;
    }
    const fields = ["email", "password", "rememberMe"] as const;
    for (const field of fields) {
      errors[field] = [];
    }
    return true;
  }

  async function handleSubmit() {
    store.clearError();
    if (!validateAll()) return;

    try {
      await store.login({ email: form.email, password: form.password });
      await router.push("/app/notes");
    } catch {
      // error is set in store
    }
  }

  return {
    handleSubmit,
    validateAll,
    validateField,
    loading,
    formError,
    errors,
    form,
  };
};
