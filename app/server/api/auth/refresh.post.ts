import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "No refresh token",
    });
  }

  try {
    const user = verifyRefreshToken(session.refreshToken as string);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const expiresAt = Date.now() + 15 * 60 * 1000;

    await setUserSession(event, {
      ...session,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
      expiresAt,
    });

    return {
      expiresIn: 900,
    };
  } catch {
    await clearUserSession(event);
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid refresh token",
    });
  }
});
