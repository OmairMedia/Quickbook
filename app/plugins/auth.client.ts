import { useAuthSession } from "~/features/auth/composables/useAuthSession";

export default defineNuxtPlugin(() => {
  const userSession = useAuthSession();

  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  function startTokenRefresh() {
    stopTokenRefresh();

    refreshInterval = setInterval(
      async () => {
        if (userSession.user.value && userSession.isExpired.value) {
          try {
            await $fetch("/api/auth/refresh", { method: "POST" });
            await userSession.fetch();
          } catch {
            await userSession.clearSession();
            navigateTo("/auth/login");
          }
        }
      },
      10 * 60 * 1000,
    );
  }

  function stopTokenRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  watch(
    () => userSession.user.value,
    (newUser) => {
      if (newUser) {
        startTokenRefresh();
      } else {
        stopTokenRefresh();
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    stopTokenRefresh();
  });

  return {
    provide: {
      refreshSession: () => userSession.fetch(),
      clearSession: () => userSession.clearSession(),
    },
  };
});
