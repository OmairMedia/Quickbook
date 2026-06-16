import { forgotPasswordSchema } from "~/features/auth/schemas/auth.schema";
import {
  findUserByEmail,
  generateResetToken,
  sendVerificationEmail,
} from "~/server/utils/auth";

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
    console.log(`[auth] Reset token for ${email}: ${token}`);
    await sendVerificationEmail(user);
  }

  return { success: true };
});
