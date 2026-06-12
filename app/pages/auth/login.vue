<template>
  <div class="auth-page">
    <div class="auth-split">
      <div class="auth-hero">
        <div class="auth-hero-content">
          <div class="auth-hero-logo">QuickNotes</div>
          <h1 class="auth-hero-heading">Welcome back</h1>
          <p class="auth-hero-text">
            Capture your thoughts, organize your ideas, and stay productive.
          </p>
          <div class="auth-hero-features">
            <div class="auth-hero-feature">
              <span class="auth-hero-feature-text"
                >Fast and lightweight note-taking</span
              >
            </div>
            <div class="auth-hero-feature">
              <span class="auth-hero-feature-text"
                >Organized with tags and categories</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="auth-form-panel">
        <div class="auth-centered">
          <div class="auth-header">
            <h1 class="auth-header-title">Sign in</h1>
            <p class="auth-header-subtitle">
              Enter your credentials to access your account
            </p>
          </div>

          <form class="auth-form" @submit.prevent="handleSubmit">
            <div v-if="formError" class="auth-form-error">
              {{ formError }}
            </div>

            <FormField
              id="email"
              label="Email address"
              :required="true"
              :error="errors.email"
            >
              <FormInput
                id="email"
                v-model="form.email"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
                :error="errors.email"
                @blur="validateField('email')"
              />
            </FormField>

            <FormField
              id="password"
              label="Password"
              :required="true"
              :error="errors.password"
            >
              <FormPassword
                id="password"
                v-model="form.password"
                autocomplete="current-password"
                :error="errors.password"
                @blur="validateField('password')"
              />
              <template #after>
                <NuxtLink to="/auth/forgot-password" class="auth-label-link">
                  Forgot password?
                </NuxtLink>
              </template>
            </FormField>

            <AppButton
              type="submit"
              variant="primary"
              size="lg"
              full-width
              :loading="loading"
              :label="loading ? 'Signing in...' : 'Sign in'"
            />
          </form>

          <div class="auth-footer">
            Don&apos;t have an account?
            <NuxtLink to="/auth/register">Sign up</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { loginSchema } from "~/features/auth/schemas/auth.schema";
import { useAuthStore } from "~/features/auth/stores/auth.store";

const store = useAuthStore();
const router = useRouter();

const form = reactive({
  email: "",
  password: "",
});

const errors = reactive<Record<string, string[]>>({
  email: [],
  password: [],
});

const formError = computed(() => store.error);
const loading = computed(() => store.loading);

function validateField(field: string) {
  const result = loginSchema.safeParse(form);
  if (!result.success) {
    const fieldErrors = result.error.issues.filter((i) => i.path[0] === field);
    errors[field] = fieldErrors.map((e) => e.message);
  } else {
    errors[field] = [];
  }
}

function validateAll(): boolean {
  const result = loginSchema.safeParse(form);
  if (!result.success) {
    for (const field of ["email", "password"]) {
      errors[field] = result.error.issues
        .filter((i) => i.path[0] === field)
        .map((e) => e.message);
    }
    return false;
  }
  for (const field of ["email", "password"]) {
    errors[field] = [];
  }
  return true;
}

async function handleSubmit() {
  store.clearError();
  if (!validateAll()) return;

  try {
    await store.login(form);
    await router.push("/app/notes");
  } catch {
    // error is set in store
  }
}
</script>
