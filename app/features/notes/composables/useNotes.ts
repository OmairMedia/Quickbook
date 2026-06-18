import { computed, ref, watch } from "vue";
import { useNoteStore } from "../stores/note.store";

export function useNotes() {
  const store = useNoteStore();
  const searchQuery = ref("");

  const notes = computed(() => store.notes);
  const loading = computed(() => store.loading);
  const error = computed(() => store.error);
  const pagination = computed(() => ({
    page: store.page,
    limit: store.limit,
    total: store.total,
    totalPages: store.totalPages,
  }));

  let searchDebounce: ReturnType<typeof setTimeout> | null = null;

  watch(searchQuery, () => {
    if (searchDebounce) clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      store.setPage(1);
      store.fetchNotes({ search: searchQuery.value || undefined });
    }, 300);
  });

  async function fetchNotes() {
    await store.fetchNotes({ search: searchQuery.value || undefined });
  }

  function setPage(page: number) {
    store.setPage(page);
    store.fetchNotes({ page, search: searchQuery.value || undefined });
  }

  return {
    notes,
    loading,
    error,
    pagination,
    searchQuery,
    fetchNotes,
    setPage,
  };
}
