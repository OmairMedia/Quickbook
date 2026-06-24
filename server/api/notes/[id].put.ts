import { updateNoteSchema } from "~/features/notes/schemas/note.schema";
import { getNoteById, updateNote } from "../../utils/notes";
import { useAuthenticatedUser } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await useAuthenticatedUser(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Note ID is required",
    });
  }

  const existing = await getNoteById(event, id);
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Note not found" });
  }

  const body = await readValidatedBody(event, (body) =>
    updateNoteSchema.safeParse(body),
  );

  if (!body.success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Validation failed",
      data: body.error.issues,
    });
  }

  const note = await updateNote(event, id, body.data);

  return note;
});
