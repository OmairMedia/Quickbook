<template>
  <form class="auth-form" @submit.prevent="handleSubmit">
    <div v-if="formError" class="auth-form-error">
      {{ formError }}
    </div>

    <UiFormField
      id="name"
      label="Full name"
      :required="true"
      :error="errors.name"
    >
      <UiFormInput
        id="name"
        v-model="form.name"
        type="text"
        placeholder="John Doe"
        autocomplete="name"
        :error="errors.name"
        @blur="validateField('name')"
      />
    </UiFormField>

    <UiFormField
      id="email"
      label="Email address"
      :required="true"
      :error="errors.email"
      :description="emailStatusText"
    >
      <UiFormInput
        id="email"
        v-model="form.email"
        type="email"
        placeholder="you@example.com"
        autocomplete="email"
        :error="errors.email"
        @blur="onEmailBlur"
        @update:model-value="onEmailInput"
      />
    </UiFormField>

    <UiFormField
      id="password"
      label="Password"
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
      label="Confirm password"
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
      :label="loading ? 'Creating account...' : 'Create account'"
    />
  </form>

  <div class="auth-footer">
    Already have an account?
    <NuxtLink to="/auth/login">Sign in</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { registerSchema } from "~/features/auth/schemas/auth.schema";
import {
  useAuthForm,
  usePasswordRequirements,
} from "~/features/auth/composables/useAuthForm";
import { authApi } from "~/features/auth/api/auth.api";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  [key: string]: unknown;
}

const { form, errors, formError, loading, validateField, validateAll, store } =
  useAuthForm<RegisterForm>(
    registerSchema,
    { name: "", email: "", password: "", confirmPassword: "" },
    ["name", "email", "password", "confirmPassword"] as const,
  );

const router = useRouter();
const showPasswordRequirements = ref(false);
const emailChecking = ref(false);
const emailAvailable = ref<boolean | null>(null);

const passwordRequirements = usePasswordRequirements(
  computed(() => form.password),
);

const emailStatusText = computed(() => {
  if (emailChecking.value) return "Checking availability...";
  if (emailAvailable.value === true) return "Email is available";
  if (emailAvailable.value === false) return "This email is already registered";
  return "";
});

let emailDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function onEmailInput() {
  errors.email = [];
  emailAvailable.value = null;
  if (emailDebounceTimer) clearTimeout(emailDebounceTimer);
}

async function onEmailBlur() {
  validateField("email");
  if (errors.email && errors.email.length > 0) return;
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
