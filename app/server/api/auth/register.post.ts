import { registerSchema } from "~/features/auth/schemas/auth.schema";
import {
  findUserByEmail,
  createUser,
  generateAccessToken,
  generateRefreshToken,
  sendVerificationEmail,
} from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) =>
    registerSchema.safeParse(body),
  );

  if (!body.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Validation failed",
      data: body.error.issues,
    });
  }

  const { email, password, name } = body.data;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: "Email already registered",
      data: { code: "EMAIL_EXISTS" },
    });
  }

  const user = await createUser({ email, password, name });

  await sendVerificationEmail(user);

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

  setResponseStatus(event, 201);
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
