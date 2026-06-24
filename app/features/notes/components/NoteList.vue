<template>
  <div class="note-list">
    <div class="note-list-header">
      <div class="note-list-search">
        <span class="note-list-search-icon">&#x1F50D;</span>
        <input
          v-model="search"
          type="text"
          placeholder="Search notes..."
          class="note-list-search-input"
        />
      </div>
    </div>

    <NoteSkeleton v-if="loading && notes.length === 0" :count="6" />

    <div v-else-if="notes.length === 0" class="note-list-empty">
      <p class="note-list-empty-text">
        {{
          searchQuery
            ? "No notes match your search."
            : "No notes yet. Create your first note!"
        }}
      </p>
      <UiButtonAppButton
        v-if="!searchQuery"
        variant="primary"
        label="Create note"
        @click="$emit('create')"
      />
    </div>

    <div v-else class="note-list-grid">
      <NoteCard
        v-for="note in notes"
        :key="note.id"
        :note="note"
        @toggle-favorite="$emit('toggle-favorite', $event)"
      />
    </div>

    <div v-if="pagination.totalPages > 1" class="note-list-pagination">
      <button
        :disabled="pagination.page <= 1"
        class="note-list-page-btn"
        @click="$emit('page-change', pagination.page - 1)"
      >
        Previous
      </button>
      <span class="note-list-page-info">
        Page {{ pagination.page }} of {{ pagination.totalPages }}
      </span>
      <button
        :disabled="pagination.page >= pagination.totalPages"
        class="note-list-page-btn"
        @click="$emit('page-change', pagination.page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import NoteCard from "./NoteCard.vue";
import NoteSkeleton from "./NoteSkeleton.vue";

const props = defineProps({
  notes: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  pagination: {
    type: Object,
    default: () => ({ page: 1, totalPages: 0, total: 0, limit: 12 }),
  },
  searchQuery: { type: String, default: "" },
});

const emit = defineEmits([
  "toggle-favorite",
  "page-change",
  "update:searchQuery",
  "create",
]);

const search = computed({
  get: () => props.searchQuery,
  set: (val) => emit("update:searchQuery", val),
});
</script>

<style scoped>
.note-list {
  display: flex;
  flex-direction: column;
  gap: var(--app-spacing-scale-6);
}

.note-list-header {
  display: flex;
  align-items: center;
  gap: var(--app-spacing-scale-4);
}

.note-list-search {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.note-list-search-icon {
  position: absolute;
  left: var(--app-spacing-scale-3);
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: var(--app-color-gray-dark);
  pointer-events: none;
}

.note-list-search-input {
  width: 100%;
  height: 40px;
  padding: 0 var(--app-spacing-scale-3) 0 var(--app-spacing-scale-9);
  font-family: var(--app-typography-family-primary);
  font-size: var(--app-typography-size-body-small);
  color: var(--app-color-black);
  background: var(--app-color-white);
  border: 1px solid var(--app-color-gray-light);
  border-radius: var(--app-border-radius-standard);
  outline: none;
  transition: border-color 0.15s ease;
}

.note-list-search-input:focus {
  border-color: var(--app-color-blue-primary);
  box-shadow: var(--app-shadow-focus);
}

.note-list-search-input::placeholder {
  color: var(--app-color-text-placeholder);
}

.note-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--app-spacing-scale-4);
}

.note-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--app-spacing-scale-12) var(--app-spacing-scale-4);
  text-align: center;
}

.note-list-empty-text {
  font-size: var(--app-typography-size-body);
  color: var(--app-color-gray-dark);
  margin: 0 0 var(--app-spacing-scale-4);
}

.note-list-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--app-spacing-scale-4);
  padding: var(--app-spacing-scale-6) 0;
}

.note-list-page-btn {
  padding: var(--app-spacing-scale-2) var(--app-spacing-scale-4);
  font-family: var(--app-typography-family-primary);
  font-size: var(--app-typography-size-body-small);
  font-weight: var(--app-typography-weight-medium);
  color: var(--app-color-black);
  background: var(--app-color-white);
  border: 1px solid var(--app-color-gray-light);
  border-radius: var(--app-border-radius-standard);
  cursor: pointer;
  transition: background 0.15s ease;
}

.note-list-page-btn:hover:not(:disabled) {
  background: var(--app-color-gray-light);
}

.note-list-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.note-list-page-info {
  font-size: var(--app-typography-size-body-small);
  color: var(--app-color-gray-dark);
}
</style>
