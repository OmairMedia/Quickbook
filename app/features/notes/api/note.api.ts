import type {
  Note,
  CreateNotePayload,
  UpdateNotePayload,
  NotesListResponse,
} from "../types/note";

export const noteApi = {
  list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    tag?: string;
  }) {
    return $fetch<NotesListResponse>("/api/notes", { params });
  },

  get(id: string) {
    return $fetch<Note>(`/api/notes/${id}`);
  },

  create(payload: CreateNotePayload) {
    return $fetch<Note>("/api/notes", {
      method: "POST",
      body: payload,
    });
  },

  update(id: string, payload: UpdateNotePayload) {
    return $fetch<Note>(`/api/notes/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  delete(id: string) {
    return $fetch<{ success: boolean }>(`/api/notes/${id}`, {
      method: "DELETE",
    });
  },
};
