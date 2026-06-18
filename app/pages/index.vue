<template>
  <div>
    <h1>Homepage</h1>
  </div>
</template>

<script setup lang="ts">
import { useAuthSession } from "~/features/auth/composables/useAuthSession";

const { user, ready } = useAuthSession();
const router = useRouter();

if (ready.value && user.value) {
  router.replace("/dashboard");
}
</script>
