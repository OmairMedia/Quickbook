import { checkEmailSchema } from "~/features/auth/schemas/auth.schema";
import { findUserByEmail } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) =>
    checkEmailSchema.safeParse(body),
  );

  if (!body.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid email",
    });
  }

  const user = await findUserByEmail(body.data.email);
  return { available: !user };
});
