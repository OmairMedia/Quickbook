<template>
  <AppBadge
    :label="label"
    :variant="agentVariant"
    :size="size"
    :dot="dot"
    :pill="pill"
    :outline="outline"
    :icon="icon"
    :dismissible="dismissible"
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
  agent: {
    type: String,
    required: true,
    validator: (v) => ["task-routing", "reporting", "qa"].includes(v),
  },
  size: { type: String, default: "md" },
  dot: { type: Boolean, default: false },
  pill: { type: Boolean, default: true },
  outline: { type: Boolean, default: false },
  icon: { type: [Object, Function], default: null },
  dismissible: { type: Boolean, default: false },
});

defineEmits(["dismiss"]);

const agentVariant = computed(() => {
  const map = {
    "task-routing": "purple",
    reporting: "teal",
    qa: "orange",
  };
  return map[props.agent] || "default";
});
</script>
