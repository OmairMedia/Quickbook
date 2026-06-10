<template>
  <span
    :class="badgeClasses"
    :style="badgeStyles"
    :role="interactive ? 'status' : undefined"
    :aria-label="computedAriaLabel"
  >
    <!-- Dot indicator -->
    <span v-if="dot" class="badge__dot" aria-hidden="true"></span>

    <!-- Leading icon -->
    <span v-if="$slots.icon || icon" class="badge__icon" aria-hidden="true">
      <slot name="icon">
        <component :is="icon" />
      </slot>
    </span>

    <!-- Label -->
    <span v-if="$slots.default || label" class="badge__label">
      <slot>{{ label }}</slot>
    </span>

    <!-- Dismiss button -->
    <button
      v-if="dismissible"
      type="button"
      class="badge__dismiss"
      :aria-label="dismissLabel"
      @click.stop="onDismiss"
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 2l6 6M8 2l-6 6"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </span>
</template>

<script setup>
import { computed } from "vue";

// ---------- Props ----------

const props = defineProps({
  // Content
  label: { type: [String, Number], default: "" },

  // Variant
  variant: {
    type: String,
    default: "default",
    validator: (v) =>
      [
        "default",
        "blue",
        "purple",
        "teal",
        "orange",
        "brown",
        "red",
        "yellow",
        "green",
        "neutral",
      ].includes(v),
  },

  // Size
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg"].includes(v),
  },

  // Style
  outline: { type: Boolean, default: false },
  dot: { type: Boolean, default: false },
  pill: { type: Boolean, default: true },

  // State
  interactive: { type: Boolean, default: false },
  dismissible: { type: Boolean, default: false },

  // Icons
  icon: { type: [Object, Function], default: null },

  // Accessibility
  ariaLabel: { type: String, default: "" },
  dismissLabel: { type: String, default: "Remove" },
});

// ---------- Emits ----------

const emit = defineEmits(["dismiss"]);

// ---------- Computed ----------

const badgeClasses = computed(() => {
  const classes = ["badge"];

  // Variant
  classes.push(`badge--${props.variant}`);

  // Outline mode
  if (props.outline) {
    classes.push("badge--outline");
  }

  // Size
  if (props.size !== "md") {
    classes.push(`badge--${props.size}`);
  }

  // Shape
  if (!props.pill) {
    classes.push("badge--rounded");
  }

  // Dot mode
  if (props.dot && !props.label && !props.dismissible) {
    classes.push("badge--dot-only");
  }

  // Interactive
  if (props.interactive) {
    classes.push("badge--interactive");
  }

  // Dismissible
  if (props.dismissible) {
    classes.push("badge--dismissible");
  }

  // Icon only
  if ((props.icon || props.dismissible) && !props.label) {
    classes.push("badge--icon-only");
  }

  return classes;
});

const badgeStyles = computed(() => {
  // Custom colors can be passed via CSS custom properties if needed
  return {};
});

const computedAriaLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel;
  if (props.dot && !props.label) return "Status indicator";
  return undefined;
});

// ---------- Methods ----------

function onDismiss() {
  emit("dismiss");
}
</script>

<style lang="scss" scoped>
// ============================================
// BADGE — Base
// ============================================

.badge {
  display: inline-flex;
  align-items: center;
  gap: $spacing-scale-1;
  padding: $component-badge-padding;
  font-family: $typography-family-primary;
  font-size: $component-badge-font-size;
  font-weight: $component-badge-font-weight;
  line-height: $component-badge-line-height;
  border-radius: $component-badge-border-radius;
  border: $component-badge-border;
  white-space: nowrap;
  user-select: none;
  vertical-align: middle;
  max-width: 100%;

  // Sizes
  &--sm {
    padding: 1px $spacing-scale-2;
    font-size: 10px;
    line-height: 14px;
    gap: 2px;

    .badge__dot {
      width: 5px;
      height: 5px;
    }

    .badge__icon {
      width: 12px;
      height: 12px;
    }
  }

  &--lg {
    padding: $spacing-scale-2 $spacing-scale-4;
    font-size: $typography-size-body-small;
    line-height: $typography-line-height-body-small;
    gap: $spacing-scale-2;

    .badge__dot {
      width: 8px;
      height: 8px;
    }

    .badge__icon {
      width: 16px;
      height: 16px;
    }
  }

  // Rounded (non-pill)
  &--rounded {
    border-radius: $border-radius-minimal;
  }
}

// ---------- Label ----------

.badge__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ---------- Dot ----------

.badge__dot {
  width: 6px;
  height: 6px;
  border-radius: $border-radius-circle;
  background-color: currentColor;
  flex-shrink: 0;
}

.badge--dot-only {
  width: 8px;
  height: 8px;
  padding: 0;
  border-radius: $border-radius-circle;
  gap: 0;
}

// ---------- Icon ----------

.badge__icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  :deep(svg) {
    width: 100%;
    height: 100%;
  }
}

// ---------- Dismiss ----------

.badge__dismiss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  padding: 0;
  margin: 0 -2px 0 0;
  border: none;
  background: none;
  color: inherit;
  opacity: 0.6;
  cursor: pointer;
  border-radius: 2px;
  transition: opacity 0.1s ease;

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 1px;
    opacity: 1;
  }
}

// ---------- Interactive ----------

.badge--interactive {
  cursor: pointer;
  transition:
    opacity 0.15s ease,
    filter 0.15s ease;

  &:hover {
    filter: brightness(0.95);
  }

  &:active {
    filter: brightness(0.9);
  }

  &:focus-visible {
    outline: 2px solid $color-interactive-primary-default;
    outline-offset: 2px;
  }
}

// ============================================
// COLOR VARIANTS
// ============================================

// Default (neutral)
.badge--default {
  background-color: $component-badge-default-background;
  color: $component-badge-default-text;
}

// Blue
.badge--blue {
  background-color: $color-status-info-background;
  color: $color-status-info-default;
}

// Purple (Task Routing)
.badge--purple {
  background-color: $color-agent-task-routing-background;
  color: $color-agent-task-routing-default;
}

// Teal (Reporting)
.badge--teal {
  background-color: $color-agent-reporting-background;
  color: $color-agent-reporting-default;
}

// Orange (Q&A)
.badge--orange {
  background-color: $color-agent-qa-background;
  color: $color-agent-qa-default;
}

// Brown
.badge--brown {
  background-color: rgba($color-brown, 0.15);
  color: $color-brown;
}

// Red (Error / Danger)
.badge--red {
  background-color: $color-status-error-background;
  color: $color-status-error-default;
}

// Yellow (Warning)
.badge--yellow {
  background-color: $color-status-warning-background;
  color: $color-status-warning-default;
}

// Green (Success)
.badge--green {
  background-color: rgba(#22c55e, 0.15);
  color: #16a34a;
}

// Neutral
.badge--neutral {
  background-color: $color-background-subtle;
  color: $color-text-secondary;
}

// ============================================
// OUTLINE VARIANTS
// ============================================

.badge--outline {
  background-color: transparent;

  &.badge--default {
    border: 1px solid $color-border-default;
    color: $color-text-secondary;
  }

  &.badge--blue {
    border: 1px solid $color-status-info-default;
    color: $color-status-info-default;
  }

  &.badge--purple {
    border: 1px solid $color-agent-task-routing-default;
    color: $color-agent-task-routing-default;
  }

  &.badge--teal {
    border: 1px solid $color-agent-reporting-default;
    color: $color-agent-reporting-default;
  }

  &.badge--orange {
    border: 1px solid $color-agent-qa-default;
    color: $color-agent-qa-default;
  }

  &.badge--brown {
    border: 1px solid $color-brown;
    color: $color-brown;
  }

  &.badge--red {
    border: 1px solid $color-status-error-default;
    color: $color-status-error-default;
  }

  &.badge--yellow {
    border: 1px solid $color-status-warning-default;
    color: $color-status-warning-default;
  }

  &.badge--green {
    border: 1px solid #16a34a;
    color: #16a34a;
  }

  &.badge--neutral {
    border: 1px solid $color-border-default;
    color: $color-text-secondary;
  }
}
</style>
