import { createNoteSchema } from "~/features/notes/schemas/note.schema";
import { createNote } from "~/server/utils/notes";
import { useAuthenticatedUser } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  await useAuthenticatedUser(event);

  const body = await readValidatedBody(event, (body) =>
    createNoteSchema.safeParse(body),
  );

  if (!body.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Validation failed",
      data: body.error.issues,
    });
  }

  const note = await createNote(event, body.data);

  setResponseStatus(event, 201);
  return note;
});
