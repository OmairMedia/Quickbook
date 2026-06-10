<template>
  <label :for="for" class="form-label">
    <span>
      <slot />
      <span v-if="required" class="form-label-required" aria-hidden="true"
        >*</span
      >
    </span>
    <span v-if="optional" class="form-label-hint">(optional)</span>
    <slot name="right" />
  </label>
</template>

<script setup>
defineProps({
  for: { type: String, default: "" },
  required: { type: Boolean, default: false },
  optional: { type: Boolean, default: false },
});
</script>
