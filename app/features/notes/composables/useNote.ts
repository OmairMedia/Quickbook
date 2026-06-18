import { computed } from "vue";
import { useNoteStore } from "../stores/note.store";

export function useNote() {
  const store = useNoteStore();

  const note = computed(() => store.currentNote);
  const loading = computed(() => store.loading);
  const error = computed(() => store.error);

  async function fetchNote(id: string) {
    await store.fetchNote(id);
  }

  return {
    note,
    loading,
    error,
    fetchNote,
  };
}
