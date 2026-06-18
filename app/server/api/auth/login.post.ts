import { loginSchema } from "~/features/auth/schemas/auth.schema";
import {
  authenticateUser,
  generateAccessToken,
  generateRefreshToken,
  toSessionUser,
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

  if (!user.emailVerified) {
    throw createError({
      statusCode: 401,
      statusMessage: "Email not verified",
      data: { code: "EMAIL_NOT_VERIFIED" },
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const expiresAt = Date.now() + 15 * 60 * 1000;

  const sessionUser = toSessionUser(user);

  await setUserSession(event, {
    user: sessionUser,
    accessToken,
    refreshToken,
    expiresAt,
  });

  return {
    user: sessionUser,
    expiresIn: 900,
  };
});
