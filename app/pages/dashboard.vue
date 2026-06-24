<template>
  <div class="dashboard-page">
    <div class="dashboard-page-header">
      <h1 class="dashboard-page-title">My Notes</h1>
      <UiButtonAppButton
        variant="primary"
        label="New note"
        @click="showCreateForm = true"
      />
    </div>

    <NoteList
      :notes="notes"
      :loading="loading"
      :pagination="pagination"
      v-model:search-query="searchQuery"
      @page-change="setPage"
      @toggle-favorite="handleToggleFavorite"
      @create="showCreateForm = true"
    />

    <div
      v-if="showCreateForm"
      class="dashboard-page-overlay"
      @click.self="showCreateForm = false"
    >
      <div class="dashboard-page-modal">
        <h2 class="dashboard-page-modal-title">Create note</h2>
        <NoteForm
          :loading="mutationLoading"
          @submit="handleCreate"
          @cancel="showCreateForm = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useNotes } from "~/features/notes/composables/useNotes";
import { useNoteMutation } from "~/features/notes/composables/useNoteMutation";
import NoteList from "~/features/notes/components/NoteList.vue";
import NoteForm from "~/features/notes/components/NoteForm.vue";

definePageMeta({
  layout: "dashboard",
});

const { notes, loading, pagination, searchQuery, fetchNotes, setPage } =
  useNotes();
const { loading: mutationLoading, createNote, updateNote } = useNoteMutation();

const showCreateForm = ref(false);

onMounted(() => {
  fetchNotes();
});

async function handleCreate(data: {
  title: string;
  content?: string;
  tags?: string[];
}) {
  await createNote(data);
  showCreateForm.value = false;
}

async function handleToggleFavorite(id: string) {
  const note = notes.value.find((n) => n.id === id);
  if (!note) return;
  await updateNote(id, { isFavorite: !note.isFavorite });
}
</script>

<style scoped>
.dashboard-page {
  max-width: 1200px;
}

.dashboard-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-spacing-scale-6);
}

.dashboard-page-title {
  font-size: var(--app-typography-size-heading-2);
  font-weight: var(--app-typography-weight-bold);
  color: var(--app-color-black);
  margin: 0;
}

.dashboard-page-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--app-spacing-scale-4);
}

.dashboard-page-modal {
  background: var(--app-color-white);
  border-radius: var(--app-border-radius-prominent);
  padding: var(--app-spacing-scale-6);
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
}

.dashboard-page-modal-title {
  font-size: var(--app-typography-size-heading-3);
  font-weight: var(--app-typography-weight-semibold);
  color: var(--app-color-black);
  margin: 0 0 var(--app-spacing-scale-5);
}
</style>
