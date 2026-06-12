import { useAuthSession } from "~/features/auth/composables/useAuthSession";

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

  const authPages = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
  ];

  if (authPages.includes(to.path) && userSession.user.value) {
    return navigateTo("/dashboard");
  }
});
