import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../utils/db";
import { emailVerificationTokens, users } from "../../db/schema";

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) =>
    verifyEmailSchema.safeParse(body),
  );

  if (!body.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid request",
      data: body.error.issues,
    });
  }

  const { token } = body.data;

  const row = db
    .select()
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.token, token))
    .get();

  if (!row) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid verification token",
      data: { code: "INVALID_VERIFICATION_TOKEN" },
    });
  }

  if (new Date(row.expiresAt) < new Date()) {
    throw createError({
      statusCode: 400,
      statusMessage: "Verification token has expired",
      data: { code: "VERIFICATION_TOKEN_EXPIRED" },
    });
  }

  db.update(users)
    .set({ emailVerified: true })
    .where(eq(users.id, row.userId))
    .run();

  db.delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.id, row.id))
    .run();

  return { success: true };
});
