<template>
  <div class="auth-page">
    <div class="auth-split">
      <div class="auth-hero">
        <div class="auth-hero-content">
          <div class="auth-hero-logo">QuickNotes</div>
          <h1 class="auth-hero-heading">Reset your password</h1>
          <p class="auth-hero-text">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>
      </div>

      <div class="auth-form-panel">
        <div class="auth-centered">
          <div class="auth-header">
            <h1 class="auth-header-title">Forgot password</h1>
            <p class="auth-header-subtitle">
              Enter your email address and we'll send you a reset link
            </p>
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

            <AppButton
              type="submit"
              variant="primary"
              size="lg"
              full-width
              :loading="loading"
              :label="loading ? 'Sending...' : 'Send reset link'"
            />
          </form>

          <div v-else class="auth-form-success">
            If an account with that email exists, we've sent a password reset
            link. Please check your inbox.
          </div>

          <div class="auth-footer">
            Remember your password?
            <NuxtLink to="/auth/login">Back to sign in</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { forgotPasswordSchema } from "~/features/auth/schemas/auth.schema";
import { useAuthStore } from "~/features/auth/stores/auth.store";

const store = useAuthStore();

const form = reactive({
  email: "",
});

const errors = reactive<Record<string, string[]>>({
  email: [],
});

const submitted = ref(false);
const formError = computed(() => store.error);
const loading = computed(() => store.loading);

function validateField(field: string) {
  const result = forgotPasswordSchema.safeParse(form);
  if (!result.success) {
    errors[field] = result.error.issues
      .filter((i) => i.path[0] === field)
      .map((e) => e.message);
  } else {
    errors[field] = [];
  }
}

function validateAll(): boolean {
  const result = forgotPasswordSchema.safeParse(form);
  if (!result.success) {
    errors.email = result.error.issues.map((e) => e.message);
    return false;
  }
  errors.email = [];
  return true;
}

async function handleSubmit() {
  store.clearError();
  if (!validateAll()) return;

  try {
    await store.forgotPassword(form);
    submitted.value = true;
  } catch {
    // error is set in store
  }
}
</script>
