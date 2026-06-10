<template>
  <select
    :id="id"
    :value="modelValue"
    :disabled="disabled"
    :required="required"
    :name="name"
    :aria-invalid="hasError"
    :aria-describedby="describedBy"
    class="form-select"
    :class="{ 'form-select--error': hasError }"
    @change="onChange"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  >
    <option v-if="placeholder" value="" disabled :hidden="!placeholderVisible">
      {{ placeholder }}
    </option>
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :disabled="option.disabled"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: [String, Number], default: "" },
  options: {
    type: Array,
    default: () => [],
    // Each option: { value, label, disabled? }
  },
  placeholder: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  name: { type: String, default: "" },
  error: { type: [String, Array], default: "" },
  descriptionId: { type: String, default: "" },
  errorId: { type: String, default: "" },
  placeholderVisible: { type: Boolean, default: true },
});

const emit = defineEmits(["update:modelValue", "blur", "focus"]);

const hasError = computed(() => {
  if (Array.isArray(props.error)) return props.error.length > 0;
  return !!props.error;
});

const describedBy = computed(() => {
  const ids = [];
  if (props.descriptionId) ids.push(props.descriptionId);
  if (hasError.value && props.errorId) ids.push(props.errorId);
  return ids.join(" ") || undefined;
});

function onChange(event) {
  emit("update:modelValue", event.target.value);
}
</script>
