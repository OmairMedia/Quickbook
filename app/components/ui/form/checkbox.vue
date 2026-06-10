<template>
  <label class="form-checkbox" :class="{ 'form-checkbox--disabled': disabled }">
    <input
      :id="id"
      :checked="modelValue"
      :disabled="disabled"
      :required="required"
      :name="name"
      :value="value"
      :aria-describedby="describedBy"
      class="form-checkbox__input"
      type="checkbox"
      @change="$emit('update:modelValue', $event.target.checked)"
      @blur="$emit('blur', $event)"
    />
    <span class="form-checkbox__control">
      <svg class="form-checkbox__icon" viewBox="0 0 12 12" aria-hidden="true">
        <path
          d="M2 6l3 3 5-6"
          stroke="currentColor"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span v-if="$slots.default || label" class="form-checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: "" },
  value: { type: [String, Number], default: "" },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  name: { type: String, default: "" },
  descriptionId: { type: String, default: "" },
  errorId: { type: String, default: "" },
});

defineEmits(["update:modelValue", "blur"]);

const describedBy = computed(() => {
  const ids = [];
  if (props.descriptionId) ids.push(props.descriptionId);
  if (props.errorId) ids.push(props.errorId);
  return ids.join(" ") || undefined;
});
</script>
