<template>
  <div
    class="btn-group"
    :class="{
      'btn-group--full': fullWidth,
      'btn-group--vertical': vertical
    }"
    role="group"
    :aria-label="ariaLabel"
  >
    <slot />
  </div>
</template>

<script setup>
defineProps({
  fullWidth: { type: Boolean, default: false },
  vertical: { type: Boolean, default: false },
  ariaLabel: { type: String, default: 'Button group' }
})
</script>

<style lang="scss" scoped>
.btn-group {
  display: inline-flex;

  .btn {
    border-radius: 0;

    &:first-child {
      border-radius: $component-button-border-radius 0 0 $component-button-border-radius;
    }

    &:last-child {
      border-radius: 0 $component-button-border-radius $component-button-border-radius 0;
    }

    &:not(:first-child) {
      margin-left: -1px;
    }
  }

  &--full {
    display: flex;

    .btn {
      flex: 1;
    }
  }

  &--vertical {
    flex-direction: column;

    .btn {
      &:first-child {
        border-radius: $component-button-border-radius $component-button-border-radius 0 0;
      }

      &:last-child {
        border-radius: 0 0 $component-button-border-radius $component-button-border-radius;
      }

      &:not(:first-child) {
        margin-left: 0;
        margin-top: -1px;
      }
    }
  }
}
</style>