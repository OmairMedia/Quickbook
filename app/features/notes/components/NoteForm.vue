<template>
  <form class="note-form" @submit.prevent="handleSubmit">
    <div v-if="formError" class="note-form-error">{{ formError }}</div>

    <div class="note-form-field">
      <label for="note-title" class="note-form-label">Title</label>
      <input
        id="note-title"
        v-model="form.title"
        type="text"
        class="note-form-input"
        :class="{ 'note-form-input--error': errors.title }"
        placeholder="Note title"
        @blur="validateField('title')"
      />
      <p v-if="errors.title" class="note-form-field-error">
        {{ errors.title[0] }}
      </p>
    </div>

    <div class="note-form-field">
      <label for="note-content" class="note-form-label">Content</label>
      <textarea
        id="note-content"
        v-model="form.content"
        class="note-form-textarea"
        placeholder="Write your note here..."
        rows="10"
      ></textarea>
    </div>

    <div class="note-form-field">
      <label for="note-tags" class="note-form-label">Tags</label>
      <input
        id="note-tags"
        v-model="tagInput"
        type="text"
        class="note-form-input"
        placeholder="Type a tag and press Enter"
        @keydown.enter.prevent="addTag"
      />
      <div v-if="form.tags && form.tags.length > 0" class="note-form-tags">
        <span v-for="(tag, i) in form.tags" :key="i" class="note-form-tag">
          {{ tag }}
          <button
            type="button"
            class="note-form-tag-remove"
            @click="removeTag(i)"
          >
            &times;
          </button>
        </span>
      </div>
    </div>

    <div class="note-form-actions">
      <UiButtonAppButton
        type="button"
        variant="ghost"
        label="Cancel"
        @click="$emit('cancel')"
      />
      <UiButtonAppButton
        type="submit"
        variant="primary"
        :label="isEditing ? 'Save changes' : 'Create note'"
        :loading="loading"
      />
    </div>
  </form>
</template>

<script setup>
import { reactive, ref } from "vue";
import {
  createNoteSchema,
  updateNoteSchema,
} from "~/features/notes/schemas/note.schema";

const props = defineProps({
  initialData: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["submit", "cancel"]);

const isEditing = !!props.initialData;

const form = reactive({
  title: props.initialData?.title ?? "",
  content: props.initialData?.content ?? "",
  tags: props.initialData?.tags ?? [],
});

const errors = reactive({ title: null, content: null, tags: null });
const formError = ref("");
const tagInput = ref("");

function addTag() {
  const tag = tagInput.value.trim();
  if (!tag) return;
  if (tag.length > 50) return;
  if (form.tags.length >= 10) return;
  if (form.tags.includes(tag)) return;
  form.tags.push(tag);
  tagInput.value = "";
}

function removeTag(index) {
  form.tags.splice(index, 1);
}

function validateField(field) {
  const schema = isEditing ? updateNoteSchema : createNoteSchema;
  const result = schema.safeParse(form);
  if (!result.success) {
    const issue = result.error.issues.find((i) => i.path[0] === field);
    errors[field] = issue ? [issue.message] : null;
  } else {
    errors[field] = null;
  }
}

function validateAll() {
  const schema = isEditing ? updateNoteSchema : createNoteSchema;
  const result = schema.safeParse(form);
  if (!result.success) {
    for (const field of ["title", "content", "tags"]) {
      const issue = result.error.issues.find((i) => i.path[0] === field);
      errors[field] = issue ? [issue.message] : null;
    }
    return false;
  }
  errors.title = null;
  errors.content = null;
  errors.tags = null;
  return true;
}

function handleSubmit() {
  formError.value = "";
  if (!validateAll()) return;
  emit("submit", { ...form });
}
</script>

<style scoped>
.note-form {
  display: flex;
  flex-direction: column;
  gap: var(--app-spacing-scale-5);
  max-width: 100%;
  padding: 0;
}

.note-form-error {
  padding: var(--app-spacing-scale-3) var(--app-spacing-scale-4);
  background: var(--app-color-status-error-background);
  border: 1px solid var(--app-color-red-error);
  border-radius: var(--app-border-radius-standard);
  color: var(--app-color-red-error);
  font-size: var(--app-typography-size-body-small);
}

.note-form-field {
  display: flex;
  flex-direction: column;
  gap: var(--app-spacing-scale-2);
}

.note-form-label {
  font-size: var(--app-typography-size-body-small);
  font-weight: var(--app-typography-weight-medium);
  color: var(--app-color-black);
}

.note-form-input {
  width: 100%;
  height: 40px;
  padding: 0 var(--app-spacing-scale-3);
  font-family: var(--app-typography-family-primary);
  font-size: var(--app-typography-size-body);
  color: var(--app-color-black);
  background: var(--app-color-white);
  border: 1px solid var(--app-color-gray-light);
  border-radius: var(--app-border-radius-standard);
  outline: none;
  transition: border-color 0.15s ease;
  box-sizing: border-box;
}

.note-form-input:focus {
  border-color: var(--app-color-blue-primary);
  box-shadow: var(--app-shadow-focus);
}

.note-form-input--error {
  border-color: var(--app-color-red-error);
}

.note-form-textarea {
  width: 100%;
  min-height: 200px;
  padding: var(--app-spacing-scale-3);
  font-family: var(--app-typography-family-primary);
  font-size: var(--app-typography-size-body);
  color: var(--app-color-black);
  background: var(--app-color-white);
  border: 1px solid var(--app-color-gray-light);
  border-radius: var(--app-border-radius-standard);
  outline: none;
  resize: vertical;
  transition: border-color 0.15s ease;
  box-sizing: border-box;
  line-height: var(--app-typography-line-height-body);
}

.note-form-textarea:focus {
  border-color: var(--app-color-blue-primary);
  box-shadow: var(--app-shadow-focus);
}

.note-form-field-error {
  font-size: var(--app-typography-size-caption);
  color: var(--app-color-red-error);
  margin: 0;
}

.note-form-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--app-spacing-scale-2);
}

.note-form-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--app-spacing-scale-1);
  font-size: var(--app-typography-size-caption);
  color: var(--app-color-blue-deep);
  background: var(--app-color-blue-surface);
  padding: 2px 8px;
  border-radius: var(--app-border-radius-minimal);
}

.note-form-tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  color: var(--app-color-blue-deep);
  padding: 0;
}

.note-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--app-spacing-scale-3);
  padding-top: var(--app-spacing-scale-4);
  border-top: 1px solid var(--app-color-gray-light);
}
</style>
