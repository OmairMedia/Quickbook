import { useAuthSession } from "~/features/auth/composables/useAuthSession";
import type {
  Permission,
  AuthMiddlewareOptions,
} from "~/features/auth/types/auth";

export default defineNuxtRouteMiddleware((to) => {
  const session = useAuthSession();
  const { user } = session;

  const options: AuthMiddlewareOptions = to.meta.auth || {};
  const {
    required = true,
    permissions = [],
    redirectTo = "/auth/login",
    guestOnly = false,
  } = options;

  if (guestOnly && user.value) {
    return navigateTo("/dashboard");
  }

  if (!required && permissions.length === 0) {
    return;
  }

  if (required && !user.value) {
    return navigateTo(
      `${redirectTo}?redirect=${encodeURIComponent(to.fullPath)}`,
    );
  }

  if (permissions.length > 0 && user.value) {
    const userPermissions = user.value.role.permissions;
    const isAdmin = user.value.role.name === "admin";

    if (!isAdmin) {
      const hasAllPermissions = permissions.every((p: Permission) =>
        userPermissions.includes(p),
      );

      if (!hasAllPermissions) {
        throw createError({
          statusCode: 403,
          statusMessage: "You do not have permission to access this page",
        });
      }
    }
  }
});
