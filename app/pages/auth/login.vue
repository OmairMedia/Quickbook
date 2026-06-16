<script setup lang="ts">
import LoginForm from "~/features/auth/components/LoginForm.vue";
</script>

<template>
  <NuxtLayout
    name="auth"
    hero-heading="Welcome back"
    hero-text="Sign in to access your notes and continue where you left off."
    form-heading="Sign in"
    form-subtitle="Enter your credentials to access your account"
  >
    <login-form />
  </NuxtLayout>
</template>
