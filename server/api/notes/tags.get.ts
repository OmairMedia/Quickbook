import { getNoteTags } from "../../utils/notes";
import { useAuthenticatedUser } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await useAuthenticatedUser(event);

  const tags = await getNoteTags(event);

  return tags;
});
