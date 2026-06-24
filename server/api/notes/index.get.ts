import { getNotes } from "../../utils/notes";
import { useAuthenticatedUser } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await useAuthenticatedUser(event);

  const query = getQuery(event);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
  const search = (query.search as string) || undefined;
  const tag = (query.tag as string) || undefined;

  const result = await getNotes(event, { page, limit, search, tag });

  return result;
});
