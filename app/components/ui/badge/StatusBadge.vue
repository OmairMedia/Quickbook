<template>
  <AppBadge
    :label="label"
    :variant="statusVariant"
    :size="size"
    :dot="dot"
    :pill="pill"
    :outline="outline"
    :icon="icon"
    :dismissible="dismissible"
    :dismiss-label="dismissLabel"
    :aria-label="ariaLabel"
    @dismiss="$emit('dismiss')"
  >
    <slot />
  </AppBadge>
</template>

<script setup>
import { computed } from "vue";
import AppBadge from "./AppBadge.vue";

const props = defineProps({
  label: { type: String, default: "" },
  status: {
    type: String,
    default: "neutral",
    validator: (v) =>
      [
        "active",
        "inactive",
        "pending",
        "draft",
        "published",
        "archived",
        "error",
        "warning",
        "success",
        "info",
        "neutral",
      ].includes(v),
  },
  size: { type: String, default: "md" },
  dot: { type: Boolean, default: false },
  pill: { type: Boolean, default: true },
  outline: { type: Boolean, default: false },
  icon: { type: [Object, Function], default: null },
  dismissible: { type: Boolean, default: false },
  dismissLabel: { type: String, default: "Remove" },
  ariaLabel: { type: String, default: "" },
});

defineEmits(["dismiss"]);

const statusVariant = computed(() => {
  const map = {
    active: "green",
    inactive: "neutral",
    pending: "yellow",
    draft: "neutral",
    published: "blue",
    archived: "neutral",
    error: "red",
    warning: "yellow",
    success: "green",
    info: "blue",
    neutral: "neutral",
  };
  return map[props.status] || "neutral";
});
</script>
