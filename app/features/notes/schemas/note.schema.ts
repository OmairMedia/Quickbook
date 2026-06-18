import { z } from "zod";

const messages = {
  title: {
    required: "Title is required",
    minLength: "Title must be at least 1 character",
    maxLength: "Title must not exceed 200 characters",
  },
  content: {
    maxLength: "Content must not exceed 100000 characters",
  },
  tags: {
    maxItems: "Maximum 10 tags allowed",
    maxLength: "Each tag must not exceed 50 characters",
  },
};

export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, messages.title.minLength)
    .max(200, messages.title.maxLength),
  content: z.string().max(100000, messages.content.maxLength).optional(),
  tags: z
    .array(z.string().max(50, messages.tags.maxLength))
    .max(10, messages.tags.maxItems)
    .optional(),
});

export const updateNoteSchema = z.object({
  title: z
    .string()
    .min(1, messages.title.minLength)
    .max(200, messages.title.maxLength)
    .optional(),
  content: z.string().max(100000, messages.content.maxLength).optional(),
  tags: z
    .array(z.string().max(50, messages.tags.maxLength))
    .max(10, messages.tags.maxItems)
    .optional(),
  isFavorite: z.boolean().optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
