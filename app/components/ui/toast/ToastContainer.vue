<template>
  <ClientOnly>
    <Teleport to="body">
      <div
        class="ui-toast-container"
        :class="`ui-toast-container--${position}`"
      >
        <TransitionGroup name="toast">
          <UiToast
            v-for="t in toasts"
            :key="t.id"
            :toast="t"
            @dismiss="remove(t.id)"
          />
        </TransitionGroup>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup>
import { useToast } from "~/composables/useToast";

const props = defineProps({
  position: {
    type: String,
    default: "top-right",
    validator: (v) =>
      [
        "top-right",
        "top-left",
        "bottom-right",
        "bottom-left",
        "top-center",
      ].includes(v),
  },
});

const { toasts, remove } = useToast();
</script>

<style lang="scss">
@use "~/assets/styles/generated/tokens.scss" as *;

.ui-toast-container {
  position: fixed;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: $spacing-scale-3;
  pointer-events: none;

  &--top-right {
    top: $spacing-scale-6;
    right: $spacing-scale-6;
  }

  &--top-left {
    top: $spacing-scale-6;
    left: $spacing-scale-6;
  }

  &--bottom-right {
    bottom: $spacing-scale-6;
    right: $spacing-scale-6;
    flex-direction: column-reverse;
  }

  &--bottom-left {
    bottom: $spacing-scale-6;
    left: $spacing-scale-6;
    flex-direction: column-reverse;
  }

  &--top-center {
    top: $spacing-scale-6;
    left: 50%;
    transform: translateX(-50%);
    align-items: center;
  }
}

.toast-enter-active {
  animation: toast-in 0.3s ease;
}

.toast-leave-active {
  animation: toast-out 0.3s ease forwards;
}

@keyframes toast-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-out {
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>
