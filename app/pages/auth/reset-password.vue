<script setup lang="ts">
import ResetPasswordForm from "~/features/auth/components/ResetPasswordForm.vue";
</script>

<template>
  <NuxtLayout
    name="auth"
    hero-heading="Set new password"
    hero-text="Choose a strong password that you haven't used before."
  >
    <reset-password-form />
  </NuxtLayout>
</template>
