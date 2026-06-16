<script setup lang="ts">
import RegisterForm from "~/features/auth/components/RegisterForm.vue";
</script>

<template>
  <NuxtLayout
    name="auth"
    hero-heading="Join QuickNotes"
    hero-text="Start capturing your ideas in seconds. Free forever, no credit card required."
    form-heading="Create an account"
    form-subtitle="Fill in the details below to get started"
  >
    <register-form />
  </NuxtLayout>
</template>
