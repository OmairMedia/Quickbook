<template>
  <form v-if="!submitted" class="auth-form" @submit.prevent="handleSubmit">
    <div v-if="formError" class="auth-form-error">
      {{ formError }}
    </div>

    <UiFormField
      id="email"
      label="Email address"
      :required="true"
      :error="errors.email"
    >
      <UiFormInput
        id="email"
        v-model="form.email"
        type="email"
        placeholder="you@example.com"
        autocomplete="email"
        :error="errors.email"
        @blur="validateField('email')"
      />
    </UiFormField>

    <UiButtonAppButton
      type="submit"
      variant="primary"
      size="lg"
      full-width
      :loading="loading"
      :label="loading ? 'Sending...' : 'Send reset link'"
    />
  </form>

  <div v-else class="auth-form-success">
    If an account with that email exists, we've sent a password reset link.
    Please check your inbox.
  </div>

  <div class="auth-footer">
    Remember your password?
    <NuxtLink to="/auth/login">Back to sign in</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { forgotPasswordSchema } from "~/features/auth/schemas/auth.schema";
import { useAuthForm } from "~/features/auth/composables/useAuthForm";
import { useToast } from "~/composables/useToast";

interface ForgotPasswordForm {
  email: string;
  [key: string]: unknown;
}

const { form, errors, formError, loading, validateField, validateAll, store } =
  useAuthForm<ForgotPasswordForm>(forgotPasswordSchema, { email: "" }, [
    "email",
  ] as const);

const { success, error: toastError } = useToast();
const submitted = ref(false);

async function handleSubmit() {
  store.clearError();
  if (!validateAll()) return;

  try {
    await store.forgotPassword(form);
    success("Reset link sent if the email exists");
    submitted.value = true;
  } catch {
    toastError(store.error || "Something went wrong. Please try again.");
  }
}
</script>
