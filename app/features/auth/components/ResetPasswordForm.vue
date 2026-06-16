<template>
  <div v-if="!token" class="auth-form-error">
    Invalid or missing reset token. Please request a new password reset link.
  </div>

  <template v-else>
    <form v-if="!submitted" class="auth-form" @submit.prevent="handleSubmit">
      <div v-if="formError" class="auth-form-error">
        {{ formError }}
      </div>

      <UiFormField
        id="password"
        label="New password"
        :required="true"
        :error="errors.password"
        description="Must be at least 8 characters"
      >
        <UiFormPassword
          id="password"
          v-model="form.password"
          autocomplete="new-password"
          :error="errors.password"
          @update:model-value="onPasswordInput"
        />
      </UiFormField>

      <div v-if="showPasswordRequirements" class="auth-password-requirements">
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
          <span>{{ req.met ? "\u2713" : "\u25CB" }}</span>
          <span>{{ req.label }}</span>
        </div>
      </div>

      <UiFormField
        id="confirmPassword"
        label="Confirm new password"
        :required="true"
        :error="errors.confirmPassword"
      >
        <UiFormPassword
          id="confirmPassword"
          v-model="form.confirmPassword"
          autocomplete="new-password"
          :error="errors.confirmPassword"
          @blur="validateField('confirmPassword')"
        />
      </UiFormField>

      <UiButtonAppButton
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
  </template>

  <div class="auth-footer">
    <NuxtLink to="/auth/login">Back to sign in</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { resetPasswordSchema } from "~/features/auth/schemas/auth.schema";
import {
  useAuthForm,
  usePasswordRequirements,
} from "~/features/auth/composables/useAuthForm";
import { useAuthStore } from "~/features/auth/stores/auth.store";
import { useToast } from "~/composables/useToast";

const route = useRoute();
const store = useAuthStore();

const token = computed(() => (route.query.token as string) || "");

interface ResetPasswordForm {
  token: string;
  password: string;
  confirmPassword: string;
  [key: string]: unknown;
}

const { form, errors, formError, loading, validateField, validateAll } =
  useAuthForm<ResetPasswordForm>(
    resetPasswordSchema,
    { token: token.value, password: "", confirmPassword: "" },
    ["password", "confirmPassword"] as const,
  );

const { success, error: toastError } = useToast();
const submitted = ref(false);
const showPasswordRequirements = ref(false);

const passwordRequirements = usePasswordRequirements(
  computed(() => form.password),
);

function onPasswordInput() {
  showPasswordRequirements.value = true;
  validateField("password");
}

async function handleSubmit() {
  store.clearError();
  if (!validateAll()) return;

  try {
    await store.resetPassword(form);
    success("Password reset successfully");
    submitted.value = true;
  } catch {
    toastError(store.error || "Password reset failed. Please try again.");
  }
}
</script>
