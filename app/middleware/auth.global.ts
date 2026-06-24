import { useAuthSession } from "~/features/auth/composables/useAuthSession";

const publicPages = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
];

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith("/api/") || to.path.startsWith("/_nuxt/")) {
    return;
  }

  const userSession = useAuthSession();

  if (userSession.isExpired.value && userSession.session.value?.refreshToken) {
    try {
      await $fetch("/api/auth/refresh", { method: "POST" });
      await userSession.fetch();
    } catch {
      await userSession.clearSession();
    }
  }

  const isPublic = publicPages.includes(to.path);

  if (isPublic && userSession.user.value) {
    return navigateTo("/dashboard");
  }

  if (!isPublic && !userSession.user.value) {
    return navigateTo(
      `/auth/login?redirect=${encodeURIComponent(to.fullPath)}`,
    );
  }
});
