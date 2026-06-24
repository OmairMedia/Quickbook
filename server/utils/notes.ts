import type { H3Event } from "h3";
import { eq, like, and, sql, desc } from "drizzle-orm";
import { db } from "../../server/utils/db";
import { notes } from "../../server/db/schema";
import { useAuthenticatedUser } from "../../server/utils/auth";

export interface ServerNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotesQuery {
  page: number;
  limit: number;
  search?: string;
  tag?: string;
}

export interface PaginatedResult<T> {
  notes: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getNotes(
  event: H3Event,
  query: NotesQuery,
): Promise<PaginatedResult<ServerNote>> {
  const user = await useAuthenticatedUser(event);
  const { page, limit, search, tag } = query;
  const offset = (page - 1) * limit;

  const conditions = [eq(notes.userId, user.id)];

  if (search) {
    conditions.push(like(notes.title, `%${search}%`));
  }

  if (tag) {
    conditions.push(like(notes.tags, `%"${tag}"%`));
  }

  const where = and(...conditions);

  const total =
    db
      .select({ count: sql<number>`count(*)` })
      .from(notes)
      .where(where)
      .get()?.count ?? 0;

  const rows = db
    .select()
    .from(notes)
    .where(where)
    .orderBy(desc(notes.updatedAt))
    .limit(limit)
    .offset(offset)
    .all();

  return {
    notes: rows.map(toServerNote),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getNoteById(
  event: H3Event,
  id: string,
): Promise<ServerNote | null> {
  const user = await useAuthenticatedUser(event);

  const row = db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
    .get();

  return row ? toServerNote(row) : null;
}

export async function createNote(
  event: H3Event,
  data: { title: string; content?: string; tags?: string[] },
): Promise<ServerNote> {
  const user = await useAuthenticatedUser(event);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.insert(notes)
    .values({
      id,
      userId: user.id,
      title: data.title,
      content: data.content ?? "",
      tags: data.tags ?? [],
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return {
    id,
    userId: user.id,
    title: data.title,
    content: data.content ?? "",
    tags: data.tags ?? [],
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateNote(
  event: H3Event,
  id: string,
  data: {
    title?: string;
    content?: string;
    tags?: string[];
    isFavorite?: boolean;
  },
): Promise<ServerNote> {
  const user = await useAuthenticatedUser(event);
  const now = new Date().toISOString();

  const updateData: Partial<typeof notes.$inferInsert> = { updatedAt: now };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.isFavorite !== undefined) updateData.isFavorite = data.isFavorite;

  db.update(notes)
    .set(updateData)
    .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
    .run();

  const row = db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
    .get();

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: "Note not found" });
  }

  return toServerNote(row);
}

export async function deleteNote(event: H3Event, id: string): Promise<void> {
  const user = await useAuthenticatedUser(event);

  db.delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
    .run();
}

export interface NoteTag {
  name: string;
  count: number;
}

export async function getNoteTags(event: H3Event): Promise<NoteTag[]> {
  const user = await useAuthenticatedUser(event);

  const rows = db
    .select({ tags: notes.tags })
    .from(notes)
    .where(eq(notes.userId, user.id))
    .all();

  const tagCounts = new Map<string, number>();

  for (const row of rows) {
    const tagList = row.tags as string[];
    if (Array.isArray(tagList)) {
      for (const tag of tagList) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }
  }

  return Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function toServerNote(row: typeof notes.$inferSelect): ServerNote {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    content: row.content ?? "",
    tags: (row.tags as string[]) ?? [],
    isFavorite: row.isFavorite,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
