import { invalidateRefreshToken } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (session?.refreshToken) {
    await invalidateRefreshToken(session.refreshToken as string);
  }

  await clearUserSession(event);

  return { success: true };
});
