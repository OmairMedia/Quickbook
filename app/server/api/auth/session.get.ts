export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });
  }

  const expiresAt = session.expiresAt as number | undefined;

  if (expiresAt && Date.now() >= expiresAt) {
    await clearUserSession(event);
    throw createError({
      statusCode: 401,
      statusMessage: "Session expired",
    });
  }

  return {
    user: session.user,
    expiresAt: session.expiresAt,
  };
});
