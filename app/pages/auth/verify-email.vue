<script setup lang="ts">
import { ref, onMounted } from "vue";

definePageMeta({
  layout: "auth",
  heroHeading: "Verify email",
  heroText: "Confirm your email address to activate your account.",
  formHeading: "Verifying your email",
  formSubtitle: "Please wait while we verify your email address.",
});

const route = useRoute();
const router = useRouter();

const status = ref<"loading" | "success" | "error">("loading");
const message = ref("");

onMounted(async () => {
  const token = route.query.token as string;
  if (!token) {
    status.value = "error";
    message.value = "No verification token provided.";
    return;
  }

  try {
    await $fetch("/api/auth/verify-email", {
      method: "POST",
      body: { token },
    });
    status.value = "success";
    message.value = "Your email has been verified successfully!";
  } catch (err: any) {
    status.value = "error";
    if (err?.data?.code === "VERIFICATION_TOKEN_EXPIRED") {
      message.value =
        "This verification link has expired. Please register again to receive a new one.";
    } else {
      message.value = "Invalid or expired verification link.";
    }
  }
});
</script>

<template>
  <div class="verify-email">
    <div v-if="status === 'loading'" class="verify-email-loading">
      <p>Verifying your email...</p>
    </div>

    <div v-else-if="status === 'success'" class="auth-form-success">
      {{ message }}
    </div>

    <div v-else class="auth-form-error">
      {{ message }}
    </div>

    <div class="auth-footer">
      <NuxtLink to="/auth/login">Back to sign in</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.verify-email {
  display: flex;
  flex-direction: column;
  gap: var(--app-spacing-scale-5);
  max-width: 400px;
}

.verify-email-loading {
  text-align: center;
  color: var(--app-color-gray-dark);
}
</style>
