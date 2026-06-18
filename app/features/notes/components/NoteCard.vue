<template>
  <NuxtLink :to="`/notes/${note.id}`" class="note-card">
    <div class="note-card-strip"></div>
    <div class="note-card-body">
      <div class="note-card-header">
        <h3 class="note-card-title">{{ note.title }}</h3>
        <button
          class="note-card-favorite"
          :class="{ 'note-card-favorite--active': note.isFavorite }"
          @click.prevent="$emit('toggle-favorite', note.id)"
          :aria-label="
            note.isFavorite ? 'Remove from favorites' : 'Add to favorites'
          "
        >
          {{ note.isFavorite ? "\u2605" : "\u2606" }}
        </button>
      </div>
      <p v-if="note.content" class="note-card-preview">{{ note.content }}</p>
      <div class="note-card-footer">
        <span class="note-card-date">{{ timeAgo(note.updatedAt) }}</span>
        <div v-if="note.tags && note.tags.length > 0" class="note-card-tags">
          <span
            v-for="tag in note.tags.slice(0, 2)"
            :key="tag"
            class="note-card-tag"
            >{{ tag }}</span
          >
          <span v-if="note.tags.length > 2" class="note-card-tag-overflow"
            >+{{ note.tags.length - 2 }}</span
          >
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  note: { type: Object, required: true },
});

defineEmits(["toggle-favorite"]);

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
.note-card {
  display: flex;
  flex-direction: column;
  background: var(--app-color-white);
  border: 1px solid var(--app-color-gray-light);
  border-radius: var(--app-border-radius-standard);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;
  cursor: pointer;
}

.note-card:hover {
  box-shadow: var(--app-shadow-subtle);
  transform: translateY(-1px);
}

.note-card-strip {
  height: 6px;
  background: var(--app-color-blue-primary);
  flex-shrink: 0;
}

.note-card-body {
  padding: var(--app-spacing-scale-4);
  display: flex;
  flex-direction: column;
  gap: var(--app-spacing-scale-2);
  flex: 1;
}

.note-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--app-spacing-scale-2);
}

.note-card-title {
  font-size: var(--app-typography-size-body);
  font-weight: var(--app-typography-weight-semibold);
  line-height: var(--app-typography-line-height-body);
  color: var(--app-color-black);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-card-favorite {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  color: var(--app-color-gray-dark);
  padding: 0;
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.note-card-favorite--active {
  color: var(--app-color-yellow-warning);
}

.note-card-preview {
  font-size: var(--app-typography-size-body-small);
  line-height: var(--app-typography-line-height-body-small);
  color: var(--app-color-gray-dark);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--app-spacing-scale-2);
  margin-top: auto;
}

.note-card-date {
  font-size: var(--app-typography-size-caption);
  color: var(--app-color-gray-dark);
}

.note-card-tags {
  display: flex;
  gap: var(--app-spacing-scale-1);
  align-items: center;
  overflow: hidden;
}

.note-card-tag {
  font-size: var(--app-typography-size-caption);
  color: var(--app-color-blue-deep);
  background: var(--app-color-blue-surface);
  padding: 1px 6px;
  border-radius: var(--app-border-radius-minimal);
  white-space: nowrap;
}

.note-card-tag-overflow {
  font-size: var(--app-typography-size-caption);
  color: var(--app-color-gray-dark);
}
</style>
