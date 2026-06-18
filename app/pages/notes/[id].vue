<template>
  <div class="note-page">
    <NoteDetails
      v-if="!isEditing"
      :note="note"
      :loading="loading"
      @edit="isEditing = true"
      @delete="handleDelete"
    />

    <div v-else class="note-page-edit">
      <h2 class="note-page-edit-title">Edit note</h2>
      <NoteForm
        :initial-data="note"
        :loading="mutationLoading"
        @submit="handleUpdate"
        @cancel="isEditing = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNote } from "~/features/notes/composables/useNote";
import { useNoteMutation } from "~/features/notes/composables/useNoteMutation";
import NoteDetails from "~/features/notes/components/NoteDetails.vue";
import NoteForm from "~/features/notes/components/NoteForm.vue";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const router = useRouter();

const { note, loading, fetchNote } = useNote();
const { loading: mutationLoading, updateNote, deleteNote } = useNoteMutation();

const isEditing = ref(false);

onMounted(() => {
  if (route.params.id) {
    fetchNote(route.params.id as string);
  }
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      isEditing.value = false;
      fetchNote(newId as string);
    }
  },
);

async function handleUpdate(data: {
  title: string;
  content?: string;
  tags?: string[];
}) {
  await updateNote(route.params.id as string, data);
  isEditing.value = false;
}

async function handleDelete(id: string) {
  await deleteNote(id);
  router.push("/dashboard");
}
</script>

<style scoped>
.note-page {
  max-width: 720px;
}

.note-page-edit-title {
  font-size: var(--app-typography-size-heading-3);
  font-weight: var(--app-typography-weight-semibold);
  color: var(--app-color-black);
  margin: 0 0 var(--app-spacing-scale-5);
}
</style>
