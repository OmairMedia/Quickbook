<template>
  <input
    :id="id"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :name="name"
    :autocomplete="autocomplete"
    :aria-invalid="hasError"
    :aria-describedby="describedBy"
    class="form-input"
    :class="{
      'form-input--error': hasError,
      'form-input--readonly': readonly,
    }"
    @input="onInput"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  />
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: [String, Number], default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  name: { type: String, default: "" },
  autocomplete: { type: String, default: "" },
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
