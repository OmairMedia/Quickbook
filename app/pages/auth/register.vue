<script setup lang="ts">
import RegisterForm from "~/features/auth/components/RegisterForm.vue";
</script>

<template>
  <NuxtLayout
    name="auth"
    hero-heading="Join QuickNotes"
    hero-text="Start capturing your ideas in seconds. Free forever, no credit card required."
    :show-features="true"
  >
    <register-form />
  </NuxtLayout>
</template>
