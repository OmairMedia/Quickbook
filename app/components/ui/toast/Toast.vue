<template>
  <div
    class="ui-toast"
    :class="`ui-toast--${toast.type}`"
    role="alert"
    :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
  >
    <div class="ui-toast__icon" aria-hidden="true">
      <!-- success -->
      <svg
        v-if="toast.type === 'success'"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.2" />
        <path
          d="M6 10l2.5 2.5L14 7"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <!-- error -->
      <svg
        v-else-if="toast.type === 'error'"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.2" />
        <path
          d="M7 7l6 6M13 7l-6 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      <!-- warning -->
      <svg
        v-else-if="toast.type === 'warning'"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path d="M10 2L2 17h16L10 2z" fill="currentColor" opacity="0.2" />
        <path
          d="M10 7v4M10 14v.01"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      <!-- info -->
      <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.2" />
        <path
          d="M10 9v5M10 6v.01"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <div class="ui-toast__body">
      <p v-if="toast.title" class="ui-toast__title">{{ toast.title }}</p>
      <p class="ui-toast__message">{{ toast.message }}</p>
    </div>

    <button v-if="toast.action" class="ui-toast__action" @click="onAction">
      {{ toast.action.label }}
    </button>

    <button
      class="ui-toast__close"
      @click="dismiss"
      aria-label="Close notification"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 3l8 8M11 3l-8 8"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";

const props = defineProps({
  toast: { type: Object, required: true },
});

const emit = defineEmits(["dismiss"]);

let timer = null;

onMounted(() => {
  if (props.toast.duration > 0) {
    timer = setTimeout(() => emit("dismiss"), props.toast.duration);
  }
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});

function dismiss() {
  if (timer) clearTimeout(timer);
  emit("dismiss");
}

function onAction() {
  props.toast.action?.onClick();
  dismiss();
}
</script>

<style lang="scss" scoped>
@use "~/assets/styles/generated/tokens.scss" as *;

.ui-toast {
  display: flex;
  align-items: flex-start;
  gap: $spacing-scale-3;
  padding: $spacing-scale-3 $spacing-scale-4;
  background: $color-background-surface;
  border-radius: $border-radius-standard;
  box-shadow: $shadow-dropdown;
  border-left: 3px solid $color-text-secondary;
  min-width: 320px;
  max-width: 420px;
  pointer-events: auto;
  animation: toast-slide-in 0.3s ease;

  &--success {
    border-left-color: $color-status-success-default;
    .ui-toast__icon {
      color: $color-status-success-default;
    }
  }

  &--error {
    border-left-color: $color-status-error-default;
    .ui-toast__icon {
      color: $color-status-error-default;
    }
  }

  &--warning {
    border-left-color: $color-status-warning-default;
    .ui-toast__icon {
      color: $color-status-warning-default;
    }
  }

  &--info {
    border-left-color: $color-status-info-default;
    .ui-toast__icon {
      color: $color-status-info-default;
    }
  }

  &__icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    margin-top: 2px;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-family: $typography-family-primary;
    font-size: $typography-size-body-small;
    font-weight: $typography-weight-semibold;
    color: $color-text-primary;
    line-height: $typography-line-height-body-small;
    margin: 0 0 2px;
  }

  &__message {
    font-family: $typography-family-primary;
    font-size: $typography-size-body-small;
    color: $color-text-secondary;
    line-height: $typography-line-height-body-small;
    margin: 0;
  }

  &__action {
    flex-shrink: 0;
    font-family: $typography-family-primary;
    font-size: $typography-size-body-small;
    font-weight: $typography-weight-medium;
    color: $color-interactive-primary-default;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    white-space: nowrap;

    &:hover {
      color: $color-interactive-primary-hover;
    }
  }

  &__close {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: $color-text-secondary;
    cursor: pointer;
    padding: 0;
    border-radius: $border-radius-minimal;
    margin-top: 1px;

    &:hover {
      color: $color-text-primary;
      background: $color-background-subtle;
    }
  }
}

@keyframes toast-slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
