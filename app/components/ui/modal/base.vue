<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="modal-fade" appear>
      <div
        v-if="modelValue"
        ref="overlayRef"
        class="modal-overlay"
        :class="overlayClasses"
        :aria-hidden="!modelValue"
        @click.self="handleOverlayClick"
      >
        <!-- Modal panel -->
        <Transition name="modal-scale" appear>
          <div
            v-if="modelValue"
            ref="modalRef"
            :class="modalClasses"
            :style="modalStyles"
            role="dialog"
            :aria-modal="modelValue"
            :aria-labelledby="titleId"
            :aria-describedby="descriptionId"
            @transitionend="onTransitionEnd"
          >
            <!-- Header -->
            <div
              v-if="$slots.header || title || !hideClose"
              class="modal__header"
            >
              <div v-if="$slots.header || title" class="modal__header-content">
                <slot name="header">
                  <h2 :id="titleId" class="modal__title">
                    {{ title }}
                  </h2>
                  <p
                    v-if="description"
                    :id="descriptionId"
                    class="modal__description"
                  >
                    {{ description }}
                  </p>
                </slot>
              </div>

              <button
                v-if="!hideClose"
                class="modal__close"
                :aria-label="closeLabel"
                type="button"
                @click="close"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div
              class="modal__body"
              :class="{ 'modal__body--no-header': !$slots.header && !title }"
            >
              <slot />
            </div>

            <!-- Footer -->
            <div
              v-if="$slots.footer"
              class="modal__footer"
              :class="{
                'modal__footer--left': footerAlign === 'left',
                'modal__footer--between': footerAlign === 'between',
              }"
            >
              <slot name="footer" :close="close" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
// ---------- Props ----------

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "" },
  description: { type: String, default: "" },

  // Size
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg", "xl", "full"].includes(v),
  },

  // Behavior
  closeOnOverlay: { type: Boolean, default: true },
  closeOnEsc: { type: Boolean, default: true },
  hideClose: { type: Boolean, default: false },
  closeLabel: { type: String, default: "Close dialog" },
  trapFocus: { type: Boolean, default: true },

  // Appearance
  variant: {
    type: String,
    default: "default",
    validator: (v) => ["default", "sheet", "alert"].includes(v),
  },
  sheetPosition: {
    type: String,
    default: "right",
    validator: (v) => ["right", "left", "bottom"].includes(v),
  },
  footerAlign: {
    type: String,
    default: "right",
    validator: (v) => ["left", "right", "between"].includes(v),
  },

  // Styling
  customClass: { type: String, default: "" },
  customStyles: { type: Object, default: () => ({}) },

  // Accessibility
  titleId: { type: String, default: "" },
  descriptionId: { type: String, default: "" },
});

// ---------- Emits ----------

const emit = defineEmits(["update:modelValue", "close", "opened", "closed"]);

// ---------- Refs ----------

const overlayRef = ref(null);
const modalRef = ref(null);
const previousActiveElement = ref(null);
const isAnimating = ref(false);
const bodyScrollbarWidth = ref(0);

// ---------- Computed ----------

const overlayClasses = computed(() => {
  const classes = [];

  if (props.variant === "sheet") {
    classes.push("modal-overlay--sheet");
    classes.push(`modal-overlay--sheet-${props.sheetPosition}`);
  }

  if (props.modelValue) {
    classes.push("modal-overlay--open");
  }

  return classes;
});

const modalClasses = computed(() => {
  const classes = ["modal"];

  // Size
  classes.push(`modal--${props.size}`);

  // Variant
  if (props.variant === "alert") classes.push("modal--alert");

  // Custom
  if (props.customClass) classes.push(props.customClass);

  return classes;
});

const modalStyles = computed(() => ({
  ...props.customStyles,
}));

// Generate unique IDs if not provided
const computedTitleId = computed(
  () =>
    props.titleId || `modal-title-${Math.random().toString(36).slice(2, 9)}`,
);
const computedDescriptionId = computed(
  () =>
    props.descriptionId ||
    `modal-desc-${Math.random().toString(36).slice(2, 9)}`,
);

// ---------- Methods ----------

function open() {
  if (isAnimating.value) return;
  emit("update:modelValue", true);
}

function close() {
  if (isAnimating.value) return;
  emit("update:modelValue", false);
  emit("close");
}

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    close();
  }
}

function handleKeydown(event) {
  if (event.key === "Escape" && props.closeOnEsc) {
    event.stopPropagation();
    close();
    return;
  }

  if (event.key === "Tab" && props.trapFocus) {
    trapTabFocus(event);
  }
}

function trapTabFocus(event) {
  if (!modalRef.value) return;

  const focusableElements = modalRef.value.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',
  );

  if (focusableElements.length === 0) {
    event.preventDefault();
    return;
  }

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
    }
  } else {
    if (document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  }
}

function onTransitionEnd(event) {
  // Only react to overlay transitions (not nested elements)
  if (event.target !== overlayRef.value) return;

  if (props.modelValue) {
    isAnimating.value = false;
    emit("opened");
  } else {
    isAnimating.value = false;
    emit("closed");
  }
}

function lockScroll() {
  // Calculate scrollbar width to prevent layout shift
  bodyScrollbarWidth.value =
    window.innerWidth - document.documentElement.clientWidth;
  document.body.style.paddingRight = `${bodyScrollbarWidth.value}px`;
  document.body.classList.add("modal-open");
  document.documentElement.style.setProperty(
    "--scrollbar-width",
    `${bodyScrollbarWidth.value}px`,
  );
}

function unlockScroll() {
  document.body.classList.remove("modal-open");
  document.body.style.paddingRight = "";
  document.documentElement.style.removeProperty("--scrollbar-width");
}

// ---------- Watchers ----------

watch(
  () => props.modelValue,
  async (isOpen) => {
    isAnimating.value = true;

    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.value = document.activeElement;

      // Prevent background scroll
      lockScroll();

      await nextTick();

      // Focus the modal
      if (modalRef.value) {
        // Try to focus the first focusable element, or the modal itself
        const focusable = modalRef.value.querySelector(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable) {
          focusable.focus();
        } else {
          modalRef.value.focus();
        }
      }

      // Add keyboard listener
      document.addEventListener("keydown", handleKeydown);
    } else {
      // Restore scroll
      unlockScroll();

      // Remove keyboard listener
      document.removeEventListener("keydown", handleKeydown);

      // Restore focus to the element that opened the modal
      await nextTick();
      if (
        previousActiveElement.value &&
        typeof previousActiveElement.value.focus === "function"
      ) {
        previousActiveElement.value.focus();
      }
    }
  },
);

// ---------- Lifecycle ----------

onBeforeUnmount(() => {
  if (props.modelValue) {
    unlockScroll();
    document.removeEventListener("keydown", handleKeydown);
  }
});
</script>

<style lang="scss" scoped>
// ---------- Overlay ----------

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-scale-4;
  background-color: rgba($color-black, 0.5);
  overflow-y: auto;

  // Sheet variant
  &--sheet {
    padding: 0;

    &-right {
      justify-content: flex-end;
    }

    &-left {
      justify-content: flex-start;
    }

    &-bottom {
      align-items: flex-end;
      justify-content: center;
    }

    .modal {
      max-height: 100vh;
      height: 100vh;
      border-radius: 0;
      margin: 0;

      @media (min-width: 640px) {
        width: 480px;
        max-width: 480px;
      }
    }
  }
}

// ---------- Modal Panel ----------

.modal {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100vh - #{$spacing-scale-8} * 2);
  background-color: $color-background-surface;
  border-radius: $border-radius-prominent;
  box-shadow: $shadow-subtle;
  outline: none;
  overflow: hidden;

  // Sizes
  &--sm {
    max-width: 400px;
  }
  &--md {
    max-width: 560px;
  }
  &--lg {
    max-width: 720px;
  }
  &--xl {
    max-width: 920px;
  }
  &--full {
    max-width: calc(100vw - #{$spacing-scale-8});
  }

  // Alert variant (centered content)
  &--alert {
    .modal__header {
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: $spacing-scale-8 $spacing-scale-6 0;
    }

    .modal__body {
      text-align: center;
    }

    .modal__footer {
      justify-content: center;
    }
  }
}

// ---------- Header ----------

.modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $spacing-scale-4;
  padding: $spacing-scale-6 $spacing-scale-6 0;
  flex-shrink: 0;
}

.modal__header-content {
  flex: 1;
  min-width: 0;
}

.modal__title {
  font-family: $typography-family-primary;
  font-size: $typography-size-subheading;
  font-weight: $typography-weight-semibold;
  line-height: $typography-line-height-subheading;
  color: $color-text-primary;
  margin: 0;
}

.modal__description {
  font-size: $typography-size-body-small;
  line-height: $typography-line-height-body-small;
  color: $color-text-secondary;
  margin: $spacing-scale-1 0 0;
}

// ---------- Close Button ----------

.modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: $spacing-scale-8;
  height: $spacing-scale-8;
  flex-shrink: 0;
  border: none;
  background: none;
  border-radius: $border-radius-standard;
  color: $color-text-secondary;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: $color-background-subtle;
    color: $color-text-primary;
  }

  &:focus-visible {
    outline: 2px solid $color-interactive-primary-default;
    outline-offset: 2px;
  }
}

// ---------- Body ----------

.modal__body {
  padding: $spacing-scale-6;
  overflow-y: auto;
  flex: 1;

  &--no-header {
    padding-top: $spacing-scale-6;
  }
}

// ---------- Footer ----------

.modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: $spacing-scale-3;
  padding: 0 $spacing-scale-6 $spacing-scale-6;
  flex-shrink: 0;

  &--left {
    justify-content: flex-start;
  }

  &--between {
    justify-content: space-between;
  }
}

// ---------- Transitions ----------

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}

// Sheet transitions
.modal-overlay--sheet-right {
  .modal-scale-enter-active,
  .modal-scale-leave-active {
    transition: transform 0.3s ease;
  }

  .modal-scale-enter-from,
  .modal-scale-leave-to {
    transform: translateX(100%);
    opacity: 1;
  }
}

.modal-overlay--sheet-left {
  .modal-scale-enter-active,
  .modal-scale-leave-active {
    transition: transform 0.3s ease;
  }

  .modal-scale-enter-from,
  .modal-scale-leave-to {
    transform: translateX(-100%);
    opacity: 1;
  }
}

.modal-overlay--sheet-bottom {
  .modal-scale-enter-active,
  .modal-scale-leave-active {
    transition: transform 0.3s ease;
  }

  .modal-scale-enter-from,
  .modal-scale-leave-to {
    transform: translateY(100%);
    opacity: 1;
  }
}

// ---------- Responsive ----------

@media (max-width: 639px) {
  .modal-overlay {
    padding: $spacing-scale-2;
  }

  .modal {
    max-height: calc(100vh - #{$spacing-scale-4});
    border-radius: $border-radius-prominent $border-radius-prominent 0 0;

    &--sm,
    &--md,
    &--lg,
    &--xl {
      max-width: 100%;
    }
  }

  .modal__header {
    padding: $spacing-scale-4 $spacing-scale-4 0;
  }

  .modal__body {
    padding: $spacing-scale-4;
  }

  .modal__footer {
    padding: 0 $spacing-scale-4 $spacing-scale-4;
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }
}
</style>

<style lang="scss">
// Global style for body scroll lock (can't be scoped since it targets body)
body.modal-open {
  overflow: hidden;
}
</style>
