import { getNoteById, deleteNote } from "../../utils/notes";
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

  await deleteNote(event, id);

  return { success: true };
});
