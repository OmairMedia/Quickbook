<template>
  <component
    :is="tag"
    :type="computedType"
    :href="href"
    :to="to"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
    :aria-busy="loading"
    :aria-label="ariaLabel"
    :class="buttonClasses"
    :target="href && external ? '_blank' : undefined"
    :rel="href && external ? 'noopener noreferrer' : undefined"
    @click="onClick"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="btn__spinner" aria-hidden="true"></span>

    <!-- Leading icon -->
    <span
      v-if="$slots.icon || icon"
      class="btn__icon"
      :class="{ 'btn__icon--leading': hasDefaultSlot }"
      aria-hidden="true"
    >
      <slot name="icon">
        <component :is="icon" />
      </slot>
    </span>

    <!-- Text content -->
    <span
      v-if="$slots.default || label"
      class="btn__text"
      :class="{ 'btn__text--hidden': loading }"
    >
      <slot>{{ label }}</slot>
    </span>

    <!-- Trailing icon (caret, external link, etc.) -->
    <span
      v-if="$slots.trailing || trailingIcon"
      class="btn__icon btn__icon--trailing"
      aria-hidden="true"
    >
      <slot name="trailing">
        <component :is="trailingIcon" />
      </slot>
    </span>
  </component>
</template>

<script setup>
import { computed, useSlots } from "vue";

const props = defineProps({
  // Content
  label: { type: String, default: "" },

  // Variant
  variant: {
    type: String,
    default: "primary",
    validator: (v) =>
      ["primary", "secondary", "ghost", "danger", "text", "link"].includes(v),
  },

  // Size
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg"].includes(v),
  },

  // Shape
  iconOnly: { type: Boolean, default: false },
  fullWidth: { type: Boolean, default: false },

  // State
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },

  // Rendering
  tag: {
    type: String,
    default: "button",
    validator: (v) => ["button", "a", "router-link"].includes(v),
  },
  type: {
    type: String,
    default: "button",
    validator: (v) => ["button", "submit", "reset"].includes(v),
  },
  href: { type: String, default: "" },
  to: { type: [String, Object], default: "" },
  external: { type: Boolean, default: false },

  // Icons (components, not strings)
  icon: { type: [Object, Function], default: null },
  trailingIcon: { type: [Object, Function], default: null },

  // Accessibility
  ariaLabel: { type: String, default: "" },
});

const emit = defineEmits(["click", "blur", "focus"]);

const slots = useSlots();
const hasDefaultSlot = computed(() => !!slots.default);

// Determine the correct type attribute (only for <button>)
const computedType = computed(() => {
  if (props.tag !== "button") return undefined;
  return props.type;
});

// Build class list
const buttonClasses = computed(() => {
  const classes = ["btn"];

  // Variant
  classes.push(`btn--${props.variant}`);

  // Size
  if (props.size !== "md") {
    classes.push(`btn--${props.size}`);
  }

  // Icon-only mode
  if (props.iconOnly) {
    classes.push("btn--icon");
    if (props.size !== "md") classes.push(`btn--${props.size}`);
  }

  // Full width
  if (props.fullWidth) {
    classes.push("btn--full");
  }

  // Loading state
  if (props.loading) {
    classes.push("btn--loading");
  }

  return classes;
});

function onClick(event) {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }
  emit("click", event);
}
</script>
