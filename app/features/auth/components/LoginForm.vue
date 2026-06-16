<template>
  <form @submit.prevent="handleSubmit">
    <div v-if="formError" class="auth-form-error">
      {{ formError }}
    </div>

    <UiFormField
      class="mb-4"
      id="email"
      label="Email address"
      :required="true"
      :error="errors.email"
      description="We'll never share your email."
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

    <UiFormField
      class="mb-4"
      id="password"
      label="Password"
      :required="true"
      :error="errors.password"
    >
      <UiFormPassword
        id="password"
        v-model="form.password"
        autocomplete="current-password"
        :error="errors.password"
        @blur="validateField('password')"
      />
    </UiFormField>

    <UiFormField class="mb-4" id="remember" :error="errors.rememberMe">
      <UiFormCheckbox
        id="remember"
        v-model="form.rememberMe"
        label="Remember Me"
        :error="errors.rememberMe"
      />
    </UiFormField>

    <UiButtonAppButton
      type="submit"
      variant="primary"
      size="lg"
      full-width
      :loading="loading"
      :label="loading ? 'Signing in...' : 'Sign in'"
    />
  </form>
</template>

<script setup lang="ts">
import { useLoginForm } from "../composables/useLoginForm";

const { form, errors, formError, handleSubmit, loading, validateField } =
  useLoginForm();
</script>

<style scoped></style>
