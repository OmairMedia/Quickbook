<script setup lang="ts">
import ForgotPasswordForm from "~/features/auth/components/ForgotPasswordForm.vue";
</script>

<template>
  <NuxtLayout
    name="auth"
    hero-heading="Reset your password"
    hero-text="Enter your email and we'll send you a link to reset your password."
  >
    <forgot-password-form />
  </NuxtLayout>
</template>
