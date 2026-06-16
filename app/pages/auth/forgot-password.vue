<script setup lang="ts">
import ForgotPasswordForm from "~/features/auth/components/ForgotPasswordForm.vue";
</script>

<template>
  <NuxtLayout
    name="auth"
    hero-heading="Reset your password"
    hero-text="Enter your email and we'll send you a link to reset your password."
    form-heading="Forgot password"
    form-subtitle="Enter your email address and we'll send you a reset link"
  >
    <forgot-password-form />
  </NuxtLayout>
</template>
