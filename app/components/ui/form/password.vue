<template>
  <div class="form-password">
    <FormInput
      :id="id"
      :model-value="modelValue"
      :type="visible ? 'text' : 'password'"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :name="name"
      :autocomplete="autocomplete"
      :error="error"
      :description-id="descriptionId"
      :error-id="errorId"
      class="form-password__input"
      @update:model-value="$emit('update:modelValue', $event)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />
    <button
      type="button"
      class="form-password__toggle"
      :aria-label="visible ? 'Hide password' : 'Show password'"
      :aria-pressed="visible"
      @click="toggleVisibility"
      tabindex="-1"
    >
      <svg
        v-if="!visible"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M2.5 10c1.667-3.333 5-5.833 7.5-5.833S15.833 6.667 17.5 10c-1.667 3.333-5 5.833-7.5 5.833S4.167 13.333 2.5 10z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg
        v-else
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3.5 3.5l13 13M8.5 9.5a2.5 2.5 0 013-3M12.5 13.5a6.667 6.667 0 01-5-2.5M6.5 7.5a6.667 6.667 0 00-4 2.5c1.667 3.333 5 5.833 7.5 5.833.833 0 1.667-.167 2.5-.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  id: { type: String, required: true },
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  name: { type: String, default: "" },
  autocomplete: { type: String, default: "current-password" },
  error: { type: [String, Array], default: "" },
  descriptionId: { type: String, default: "" },
  errorId: { type: String, default: "" },
});

defineEmits(["update:modelValue", "blur", "focus"]);

const visible = ref(false);

function toggleVisibility() {
  visible.value = !visible.value;
}
</script>

<style lang="scss" scoped>
.form-password {
  position: relative;

  &__input {
    padding-right: $spacing-scale-10;
  }

  &__toggle {
    position: absolute;
    right: $spacing-scale-1;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: $spacing-scale-9;
    height: $spacing-scale-9;
    border: none;
    background: none;
    color: $color-text-secondary;
    cursor: pointer;
    border-radius: $border-radius-standard;
    transition:
      color 0.15s ease,
      background-color 0.15s ease;

    &:hover {
      color: $color-text-primary;
      background-color: $color-background-subtle;
    }
  }
}
</style>
