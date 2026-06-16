import { resetPasswordSchema } from "~/features/auth/schemas/auth.schema";
import { verifyResetToken, updatePassword } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) =>
    resetPasswordSchema.safeParse(body),
  );

  if (!body.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Validation failed",
      data: body.error.issues,
    });
  }

  const { token, password } = body.data;

  const result = verifyResetToken(token);

  if (!result.valid) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or expired reset token",
      data: { code: "INVALID_RESET_TOKEN" },
    });
  }

  await updatePassword(result.email ?? "", password);

  return { success: true };
});
