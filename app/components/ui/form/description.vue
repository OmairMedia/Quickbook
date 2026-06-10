<template>
  <p :id="id" class="form-helper">
    <slot>
      {{ text }}
    </slot>
  </p>
</template>

<script setup>
defineProps({
  text: { type: String, default: "" },
  id: { type: String, default: "" },
});
</script>
