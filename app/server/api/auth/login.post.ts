import { loginSchema } from "~/features/auth/schemas/auth.schema";
import {
  authenticateUser,
  generateAccessToken,
  generateRefreshToken,
} from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) =>
    loginSchema.safeParse(body),
  );

  if (!body.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Validation failed",
      data: body.error.issues,
    });
  }

  const { email, password } = body.data;

  const user = await authenticateUser(email, password);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
      data: { code: "INVALID_CREDENTIALS" },
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const expiresAt = Date.now() + 15 * 60 * 1000;

  await setUserSession(event, {
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
    expiresIn: 900,
  };
});
