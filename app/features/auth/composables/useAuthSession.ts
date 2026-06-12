import type { User } from "../types/auth";

export function useAuthSession() {
  const nuxtSession = useUserSession();

  const user = computed<User | null>(() => {
    return nuxtSession.user.value as unknown as User | null;
  });

  const isExpired = computed<boolean>(() => {
    const expiresAt = nuxtSession.session.value?.expiresAt as
      | number
      | undefined;
    if (!expiresAt) return true;
    return Date.now() >= expiresAt;
  });

  const timeUntilExpiry = computed<number>(() => {
    const expiresAt = nuxtSession.session.value?.expiresAt as
      | number
      | undefined;
    if (!expiresAt) return 0;
    return Math.max(0, expiresAt - Date.now());
  });

  async function clearSession(): Promise<void> {
    await nuxtSession.clear();
  }

  return {
    user,
    session: nuxtSession.session,
    loggedIn: nuxtSession.loggedIn,
    ready: nuxtSession.ready,
    isExpired,
    timeUntilExpiry,
    fetch: nuxtSession.fetch,
    clearSession,
    openInPopup: nuxtSession.openInPopup,
  };
}
