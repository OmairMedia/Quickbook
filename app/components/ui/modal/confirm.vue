<template>
  <AppModal
    :model-value="modelValue"
    :title="title"
    :description="description"
    :size="size"
    variant="alert"
    :close-on-overlay="closeOnOverlay"
    :close-on-esc="closeOnEsc"
    :hide-close="hideClose"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="$emit('close')"
    @opened="$emit('opened')"
    @closed="$emit('closed')"
  >
    <slot>
      <p v-if="message" class="confirm-modal__message">
        {{ message }}
      </p>
    </slot>

    <template #footer="{ close }">
      <AppButton
        variant="secondary"
        :label="cancelLabel"
        @click="onCancel(close)"
      />
      <AppButton
        :variant="confirmVariant"
        :label="confirmLabel"
        :loading="loading"
        @click="onConfirm(close)"
      />
    </template>
  </AppModal>
</template>

<script setup>
import AppModal from "./AppModal.vue";
import AppButton from "@/components/button/AppButton.vue";

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "Confirm action" },
  description: { type: String, default: "" },
  message: { type: String, default: "Are you sure you want to proceed?" },
  confirmLabel: { type: String, default: "Confirm" },
  cancelLabel: { type: String, default: "Cancel" },
  confirmVariant: {
    type: String,
    default: "primary",
    validator: (v) => ["primary", "danger"].includes(v),
  },
  loading: { type: Boolean, default: false },
  size: { type: String, default: "sm" },
  closeOnOverlay: { type: Boolean, default: false },
  closeOnEsc: { type: Boolean, default: true },
  hideClose: { type: Boolean, default: true },
});

const emit = defineEmits([
  "update:modelValue",
  "confirm",
  "cancel",
  "close",
  "opened",
  "closed",
]);

function onConfirm(closeFn) {
  emit("confirm");
}

function onCancel(closeFn) {
  emit("cancel");
  closeFn();
}
</script>

<style lang="scss" scoped>
.confirm-modal__message {
  font-size: $typography-size-body;
  line-height: $typography-line-height-body;
  color: $color-text-primary;
}
</style>
