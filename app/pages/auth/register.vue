<template>
  <div class="auth-page">
    <div class="auth-split">
      <div class="auth-hero">
        <div class="auth-hero-content">
          <div class="auth-hero-logo">QuickNotes</div>
          <h1 class="auth-hero-heading">Join QuickNotes</h1>
          <p class="auth-hero-text">
            Start capturing your ideas in seconds. Free forever, no credit card
            required.
          </p>
          <div class="auth-hero-features">
            <div class="auth-hero-feature">
              <span class="auth-hero-feature-text"
                >Unlimited notes and notebooks</span
              >
            </div>
            <div class="auth-hero-feature">
              <span class="auth-hero-feature-text"
                >Markdown support and rich editing</span
              >
            </div>
            <div class="auth-hero-feature">
              <span class="auth-hero-feature-text"
                >Sync across all your devices</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="auth-form-panel">
        <div class="auth-centered">
          <div class="auth-header">
            <h1 class="auth-header-title">Create an account</h1>
            <p class="auth-header-subtitle">
              Fill in the details below to get started
            </p>
          </div>

          <form class="auth-form" @submit.prevent="handleSubmit">
            <div v-if="formError" class="auth-form-error">
              {{ formError }}
            </div>

            <FormField
              id="name"
              label="Full name"
              :required="true"
              :error="errors.name"
            >
              <FormInput
                id="name"
                v-model="form.name"
                type="text"
                placeholder="John Doe"
                autocomplete="name"
                :error="errors.name"
                @blur="validateField('name')"
              />
            </FormField>

            <FormField
              id="email"
              label="Email address"
              :required="true"
              :error="errors.email"
              :description="emailStatusText"
            >
              <FormInput
                id="email"
                v-model="form.email"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
                :error="errors.email"
                @blur="onEmailBlur"
                @update:model-value="onEmailInput"
              />
            </FormField>

            <FormField
              id="password"
              label="Password"
              :required="true"
              :error="errors.password"
              description="Must be at least 8 characters"
            >
              <FormPassword
                id="password"
                v-model="form.password"
                autocomplete="new-password"
                :error="errors.password"
                @update:model-value="onPasswordInput"
              />
            </FormField>

            <div
              v-if="showPasswordRequirements"
              class="auth-password-requirements"
            >
              <div
                v-for="req in passwordRequirements"
                :key="req.label"
                class="auth-password-requirements-item"
                :class="
                  req.met
                    ? 'auth-password-requirements-item--met'
                    : 'auth-password-requirements-item--unmet'
                "
              >
                <span>{{ req.met ? "✓" : "○" }}</span>
                <span>{{ req.label }}</span>
              </div>
            </div>

            <FormField
              id="confirmPassword"
              label="Confirm password"
              :required="true"
              :error="errors.confirmPassword"
            >
              <FormPassword
                id="confirmPassword"
                v-model="form.confirmPassword"
                autocomplete="new-password"
                :error="errors.confirmPassword"
                @blur="validateField('confirmPassword')"
              />
            </FormField>

            <AppButton
              type="submit"
              variant="primary"
              size="lg"
              full-width
              :loading="loading"
              :label="loading ? 'Creating account...' : 'Create account'"
            />
          </form>

          <div class="auth-footer">
            Already have an account?
            <NuxtLink to="/auth/login">Sign in</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { registerSchema } from "~/features/auth/schemas/auth.schema";
import { useAuthStore } from "~/features/auth/stores/auth.store";
import { authApi } from "~/features/auth/api/auth.api";

const store = useAuthStore();
const router = useRouter();

const form = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

interface FormErrors {
  name: string[];
  email: string[];
  password: string[];
  confirmPassword: string[];
}

const errors = reactive<FormErrors>({
  name: [],
  email: [],
  password: [],
  confirmPassword: [],
});

const formError = computed(() => store.error);
const loading = computed(() => store.loading);

const showPasswordRequirements = ref(false);
const emailChecking = ref(false);
const emailAvailable = ref<boolean | null>(null);

const emailStatusText = computed(() => {
  if (emailChecking.value) return "Checking availability...";
  if (emailAvailable.value === true) return "Email is available";
  if (emailAvailable.value === false) return "This email is already registered";
  return "";
});

const passwordRequirements = computed(() => [
  { label: "At least 8 characters", met: form.password.length >= 8 },
  { label: "One uppercase letter", met: /[A-Z]/.test(form.password) },
  { label: "One lowercase letter", met: /[a-z]/.test(form.password) },
  { label: "One number", met: /[0-9]/.test(form.password) },
  {
    label: "One special character",
    met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(form.password),
  },
  { label: "No spaces", met: !/\s/.test(form.password) },
]);

let emailDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function onEmailInput() {
  errors.email = [];
  emailAvailable.value = null;
  if (emailDebounceTimer) clearTimeout(emailDebounceTimer);
}

async function onEmailBlur() {
  validateField("email");
  if (errors.email.length > 0) return;
  if (!form.email) return;

  emailChecking.value = true;
  try {
    const response = await authApi.checkEmailAvailability(form.email);
    emailAvailable.value = response.available;
    if (!response.available) {
      errors.email = ["This email is already registered"];
    }
  } catch {
    emailAvailable.value = null;
  } finally {
    emailChecking.value = false;
  }
}

function onPasswordInput() {
  showPasswordRequirements.value = true;
  validateField("password");
}

function validateField(field: keyof typeof errors) {
  const result = registerSchema.safeParse(form);
  if (!result.success) {
    const fieldErrors = result.error.issues.filter((i) => i.path[0] === field);
    errors[field] = fieldErrors.map((e) => e.message);
  } else {
    errors[field] = [];
  }
}

function validateAll(): boolean {
  const result = registerSchema.safeParse(form);
  if (!result.success) {
    const fields = ["name", "email", "password", "confirmPassword"] as const;
    for (const field of fields) {
      errors[field] = result.error.issues
        .filter((i) => i.path[0] === field)
        .map((e) => e.message);
    }
    return false;
  }
  const fields = ["name", "email", "password", "confirmPassword"] as const;
  for (const field of fields) {
    errors[field] = [];
  }
  return true;
}

async function handleSubmit() {
  store.clearError();
  if (!validateAll()) return;

  try {
    await store.register(form);
    await router.push("/app/notes");
  } catch {
    // error is set in store
  }
}
</script>
