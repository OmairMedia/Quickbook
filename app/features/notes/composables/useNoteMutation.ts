import { computed } from "vue";
import { useNoteStore } from "../stores/note.store";
import { useToast } from "~/composables/useToast";
import type { CreateNotePayload, UpdateNotePayload } from "../types/note";

export function useNoteMutation() {
  const store = useNoteStore();
  const { success, error: toastError } = useToast();

  const loading = computed(() => store.loading);
  const error = computed(() => store.error);

  async function createNote(payload: CreateNotePayload) {
    try {
      const note = await store.createNote(payload);
      success("Note created successfully");
      return note;
    } catch {
      toastError(store.error || "Failed to create note");
      throw store.error;
    }
  }

  async function updateNote(id: string, payload: UpdateNotePayload) {
    try {
      const note = await store.updateNote(id, payload);
      success("Note updated successfully");
      return note;
    } catch {
      toastError(store.error || "Failed to update note");
      throw store.error;
    }
  }

  async function deleteNote(id: string) {
    try {
      await store.deleteNote(id);
      success("Note deleted successfully");
    } catch {
      toastError(store.error || "Failed to delete note");
      throw store.error;
    }
  }

  return {
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
  };
}
