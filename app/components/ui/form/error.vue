<template>
  <p
    :id="id"
    class="form-helper form-helper--error"
    role="alert"
    aria-live="polite"
  >
    <slot>
      {{ message }}
    </slot>
  </p>
</template>

<script setup>
defineProps({
  message: { type: String, default: "" },
  id: { type: String, default: "" },
});
</script>
