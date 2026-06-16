<template>
  <div class="form-group" :class="{ 'form-group--inline': inline }">
    <UiFormLabel
      v-if="label"
      :for="id"
      :required="required"
      :optional="optional"
    >
      {{ label }}
    </UiFormLabel>

    <slot />

    <UiFormDescription v-if="description && !hasError">
      {{ description }}
    </UiFormDescription>

    <UiFormError v-if="hasError" :message="errorMessage" />

    <slot name="after" />
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: "" },
  description: { type: String, default: "" },
  error: { type: [String, Array], default: "" },
  required: { type: Boolean, default: false },
  optional: { type: Boolean, default: false },
  inline: { type: Boolean, default: false },
});

const errorMessage = computed(() => {
  if (Array.isArray(props.error)) return props.error[0];
  return props.error;
});

const hasError = computed(() => {
  if (Array.isArray(props.error)) return props.error.length > 0;
  return !!props.error;
});
</script>

<style lang="scss" scoped>
@use "~/assets/styles/generated/tokens.scss" as *;
</style>
