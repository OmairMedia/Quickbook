<template>
  <div class="auth-page">
    <div class="auth-split">
      <div class="auth-hero">
        <div class="auth-hero-content">
          <div class="auth-hero-logo">QuickNotes</div>
          <h1 class="auth-hero-heading">Set new password</h1>
          <p class="auth-hero-text">
            Choose a strong password that you haven't used before.
          </p>
        </div>
      </div>

      <div class="auth-form-panel">
        <div class="auth-centered">
          <div v-if="!token" class="auth-form-error">
            Invalid or missing reset token. Please request a new password reset
            link.
          </div>

          <template v-else>
            <div class="auth-header">
              <h1 class="auth-header-title">Reset password</h1>
              <p class="auth-header-subtitle">Enter your new password below</p>
            </div>

            <form
              v-if="!submitted"
              class="auth-form"
              @submit.prevent="handleSubmit"
            >
              <div v-if="formError" class="auth-form-error">
                {{ formError }}
              </div>

              <FormField
                id="password"
                label="New password"
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
                label="Confirm new password"
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
                :label="loading ? 'Resetting...' : 'Reset password'"
              />
            </form>

            <div v-else class="auth-form-success">
              Your password has been reset successfully.
            </div>

            <div class="auth-footer">
              <NuxtLink to="/auth/login">Back to sign in</NuxtLink>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { resetPasswordSchema } from "~/features/auth/schemas/auth.schema";
import { useAuthStore } from "~/features/auth/stores/auth.store";

const store = useAuthStore();
const router = useRouter();
const route = useRoute();

const token = computed(() => (route.query.token as string) || "");

const form = reactive({
  token: "",
  password: "",
  confirmPassword: "",
});

const errors = reactive<Record<string, string[]>>({
  password: [],
  confirmPassword: [],
});

const submitted = ref(false);
const showPasswordRequirements = ref(false);
const formError = computed(() => store.error);
const loading = computed(() => store.loading);

form.token = token.value;

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

function onPasswordInput() {
  showPasswordRequirements.value = true;
  validateField("password");
}

function validateField(field: string) {
  const result = resetPasswordSchema.safeParse(form);
  if (!result.success) {
    errors[field] = result.error.issues
      .filter((i) => i.path[0] === field)
      .map((e) => e.message);
  } else {
    errors[field] = [];
  }
}

function validateAll(): boolean {
  const result = resetPasswordSchema.safeParse(form);
  if (!result.success) {
    for (const field of ["password", "confirmPassword"]) {
      errors[field] = result.error.issues
        .filter((i) => i.path[0] === field)
        .map((e) => e.message);
    }
    return false;
  }
  for (const field of ["password", "confirmPassword"]) {
    errors[field] = [];
  }
  return true;
}

async function handleSubmit() {
  store.clearError();
  if (!validateAll()) return;

  try {
    await store.resetPassword(form);
    submitted.value = true;
  } catch {
    // error is set in store
  }
}
</script>
