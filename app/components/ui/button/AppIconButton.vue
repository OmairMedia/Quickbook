<template>
  <AppButton
    :label="label"
    :variant="variant"
    :size="size"
    :icon-only="true"
    :disabled="disabled"
    :loading="loading"
    :tag="tag"
    :type="type"
    :href="href"
    :to="to"
    :external="external"
    :aria-label="computedAriaLabel"
    :icon="icon"
    @click="$emit('click', $event)"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  />
</template>

<script setup>
import { computed } from "vue";
import AppButton from "./AppButton.vue";

const props = defineProps({
  label: { type: String, default: "" },
  variant: { type: String, default: "text" },
  size: { type: String, default: "md" },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  tag: { type: String, default: "button" },
  type: { type: String, default: "button" },
  href: { type: String, default: "" },
  to: { type: [String, Object], default: "" },
  external: { type: Boolean, default: false },
  ariaLabel: { type: String, default: "" },
  icon: { type: [Object, Function], default: null },
});

defineEmits(["click", "blur", "focus"]);

const computedAriaLabel = computed(() => {
  return props.ariaLabel || props.label || "Icon button";
});
</script>
