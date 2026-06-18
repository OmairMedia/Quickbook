<template>
  <div class="note-skeleton-grid">
    <div v-for="n in count" :key="n" class="note-skeleton-card">
      <div class="note-skeleton-bar note-skeleton-bar--strip"></div>
      <div class="note-skeleton-body">
        <div class="note-skeleton-bar note-skeleton-bar--title"></div>
        <div class="note-skeleton-bar note-skeleton-bar--line"></div>
        <div class="note-skeleton-bar note-skeleton-bar--line-short"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 6 },
});
</script>

<style scoped>
.note-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--app-spacing-scale-4);
}

.note-skeleton-card {
  background: var(--app-color-white);
  border: 1px solid var(--app-color-gray-light);
  border-radius: var(--app-border-radius-standard);
  overflow: hidden;
}

.note-skeleton-bar--strip {
  height: 6px;
  background: var(--app-color-gray-light);
}

.note-skeleton-body {
  padding: var(--app-spacing-scale-4);
  display: flex;
  flex-direction: column;
  gap: var(--app-spacing-scale-2);
}

.note-skeleton-bar {
  background: linear-gradient(
    90deg,
    var(--app-color-gray-light) 25%,
    var(--app-color-cream-default) 50%,
    var(--app-color-gray-light) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--app-border-radius-minimal);
}

.note-skeleton-bar--title {
  height: 16px;
  width: 70%;
}

.note-skeleton-bar--line {
  height: 12px;
  width: 100%;
}

.note-skeleton-bar--line-short {
  height: 12px;
  width: 55%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
