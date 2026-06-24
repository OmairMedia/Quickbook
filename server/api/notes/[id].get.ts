import { getNoteById } from "../../utils/notes";
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

  const note = await getNoteById(event, id);

  if (!note) {
    throw createError({ statusCode: 404, statusMessage: "Note not found" });
  }

  return note;
});
