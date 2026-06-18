<template>
  <div v-if="note" class="note-details">
    <div class="note-details-header">
      <NuxtLink to="/dashboard" class="note-details-back"
        >&larr; Back to notes</NuxtLink
      >
      <div class="note-details-actions">
        <UiButtonAppButton
          variant="secondary"
          size="sm"
          label="Edit"
          @click="$emit('edit')"
        />
        <UiButtonAppButton
          variant="danger"
          size="sm"
          label="Delete"
          @click="$emit('delete', note.id)"
        />
      </div>
    </div>

    <h1 class="note-details-title">{{ note.title }}</h1>

    <div class="note-details-meta">
      <span>Updated {{ timeAgo(note.updatedAt) }}</span>
      <span v-if="note.createdAt !== note.updatedAt"
        >Created {{ timeAgo(note.createdAt) }}</span
      >
    </div>

    <div v-if="note.tags && note.tags.length > 0" class="note-details-tags">
      <span v-for="tag in note.tags" :key="tag" class="note-details-tag">{{
        tag
      }}</span>
    </div>

    <div v-if="note.content" class="note-details-content">
      {{ note.content }}
    </div>

    <div v-else class="note-details-empty">
      <p>No content</p>
    </div>
  </div>

  <div v-else-if="loading" class="note-details-loading">
    <p>Loading note...</p>
  </div>

  <div v-else class="note-details-error">
    <p>Note not found.</p>
    <NuxtLink to="/dashboard">Back to dashboard</NuxtLink>
  </div>
</template>

<script setup>
defineProps({
  note: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});

defineEmits(["edit", "delete"]);

function timeAgo(dateStr) {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
</script>

<style scoped>
.note-details {
  max-width: 720px;
}

.note-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--app-spacing-scale-6);
}

.note-details-back {
  font-size: var(--app-typography-size-body-small);
  color: var(--app-color-blue-primary);
  text-decoration: none;
}

.note-details-back:hover {
  text-decoration: underline;
}

.note-details-actions {
  display: flex;
  gap: var(--app-spacing-scale-2);
}

.note-details-title {
  font-size: var(--app-typography-size-heading-2);
  font-weight: var(--app-typography-weight-bold);
  line-height: var(--app-typography-line-height-heading-2);
  color: var(--app-color-black);
  margin: 0 0 var(--app-spacing-scale-3);
}

.note-details-meta {
  display: flex;
  gap: var(--app-spacing-scale-4);
  font-size: var(--app-typography-size-caption);
  color: var(--app-color-gray-dark);
  margin-bottom: var(--app-spacing-scale-4);
}

.note-details-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--app-spacing-scale-2);
  margin-bottom: var(--app-spacing-scale-6);
}

.note-details-tag {
  font-size: var(--app-typography-size-caption);
  color: var(--app-color-blue-deep);
  background: var(--app-color-blue-surface);
  padding: 2px 8px;
  border-radius: var(--app-border-radius-minimal);
}

.note-details-content {
  font-size: var(--app-typography-size-body);
  line-height: var(--app-typography-line-height-body);
  color: var(--app-color-black);
  white-space: pre-wrap;
}

.note-details-empty {
  color: var(--app-color-gray-dark);
  font-style: italic;
}

.note-details-loading,
.note-details-error {
  padding: var(--app-spacing-scale-12) 0;
  text-align: center;
  color: var(--app-color-gray-dark);
}
</style>
