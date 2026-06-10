<template>
  <textarea
    :id="id"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :name="name"
    :rows="rows"
    :aria-invalid="hasError"
    :aria-describedby="describedBy"
    class="form-textarea"
    :class="{ 'form-textarea--error': hasError }"
    @input="onInput"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  ></textarea>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  name: { type: String, default: "" },
  rows: { type: Number, default: 4 },
  error: { type: [String, Array], default: "" },
  descriptionId: { type: String, default: "" },
  errorId: { type: String, default: "" },
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

function onInput(event) {
  emit("update:modelValue", event.target.value);
}
</script>
