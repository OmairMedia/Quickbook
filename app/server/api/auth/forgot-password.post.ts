import { forgotPasswordSchema } from "~/features/auth/schemas/auth.schema";
import { findUserByEmail, generateResetToken } from "~/server/utils/auth";
import { sendPasswordResetEmail } from "~/server/utils/email";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) =>
    forgotPasswordSchema.safeParse(body),
  );

  if (!body.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Validation failed",
      data: body.error.issues,
    });
  }

  const { email } = body.data;

  const user = await findUserByEmail(email);

  if (user) {
    const token = generateResetToken(user);
    await sendPasswordResetEmail(email, token);
  }

  return { success: true };
});
