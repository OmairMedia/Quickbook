<template>
  <div :class="tabsWrapperClasses">
    <!-- Tab List -->
    <div
      ref="tabListRef"
      :class="tabListClasses"
      role="tablist"
      :aria-orientation="vertical ? 'vertical' : 'horizontal'"
      :aria-label="ariaLabel"
      @keydown="handleKeydown"
    >
      <button
        v-for="(tab, index) in tabs"
        :key="tab.value || index"
        :ref="(el) => setTabRef(el, index)"
        :id="getTabId(index)"
        :class="getTabClasses(index)"
        :disabled="tab.disabled"
        :aria-selected="isActive(index)"
        :aria-controls="getPanelId(index)"
        :tabindex="isActive(index) ? 0 : -1"
        role="tab"
        type="button"
        @click="selectTab(index)"
      >
        <!-- Icon -->
        <span
          v-if="tab.icon || $slots[`icon-${tab.value}`]"
          class="tabs__icon"
          aria-hidden="true"
        >
          <slot :name="`icon-${tab.value}`">
            <component :is="tab.icon" />
          </slot>
        </span>

        <!-- Label -->
        <span class="tabs__label">
          <slot :name="`label-${tab.value}`" :tab="tab">
            {{ tab.label }}
          </slot>
        </span>

        <!-- Badge / Count -->
        <span
          v-if="
            tab.count !== undefined || tab.badge || $slots[`badge-${tab.value}`]
          "
          class="tabs__badge"
        >
          <slot :name="`badge-${tab.value}`" :tab="tab">
            {{ tab.count !== undefined ? formatCount(tab.count) : tab.badge }}
          </slot>
        </span>
      </button>

      <!-- Active indicator (animated underline for horizontal) -->
      <span
        v-if="!vertical && variant === 'underline' && !fill"
        class="tabs__indicator"
        :style="indicatorStyles"
        aria-hidden="true"
      />
    </div>

    <!-- Tab Panels -->
    <div class="tabs__panels">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.value || index"
        :id="getPanelId(index)"
        :class="getPanelClasses(index)"
        role="tabpanel"
        :aria-labelledby="getTabId(index)"
        :tabindex="isActive(index) ? 0 : -1"
        :hidden="!isActive(index) && !keepAlive"
      >
        <template v-if="keepAlive">
          <div v-show="isActive(index)">
            <slot
              :name="`panel-${tab.value}`"
              :tab="tab"
              :index="index"
              :is-active="isActive(index)"
            />
          </div>
        </template>
        <template v-else>
          <slot
            v-if="isActive(index)"
            :name="`panel-${tab.value}`"
            :tab="tab"
            :index="index"
            :is-active="true"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
// ---------- Props ----------

const props = defineProps({
  // Data
  tabs: {
    type: Array,
    required: true,
    // Each tab: { value, label, icon?, count?, badge?, disabled? }
  },
  modelValue: { type: [String, Number], default: "" },

  // Variant
  variant: {
    type: String,
    default: "underline",
    validator: (v) => ["underline", "pills", "boxed"].includes(v),
  },

  // Layout
  vertical: { type: Boolean, default: false },
  fill: { type: Boolean, default: false },
  align: {
    type: String,
    default: "start",
    validator: (v) => ["start", "center", "end"].includes(v),
  },

  // Behavior
  keepAlive: { type: Boolean, default: false },

  // Appearance
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg"].includes(v),
  },

  // Accessibility
  ariaLabel: { type: String, default: "Tabs" },
});

// ---------- Emits ----------

const emit = defineEmits(["update:modelValue", "change"]);

// ---------- Refs ----------

const tabListRef = ref(null);
const tabRefs = ref([]);

function setTabRef(el, index) {
  tabRefs.value[index] = el;
}

// ---------- Computed ----------

const activeIndex = computed(() => {
  if (props.modelValue) {
    const idx = props.tabs.findIndex((t) => t.value === props.modelValue);
    return idx >= 0 ? idx : 0;
  }
  return 0;
});

// Wrapper classes
const tabsWrapperClasses = computed(() => {
  return [
    "tabs",
    `tabs--${props.variant}`,
    `tabs--${props.size}`,
    {
      "tabs--vertical": props.vertical,
      "tabs--fill": props.fill,
      [`tabs--align-${props.align}`]: !props.fill,
    },
  ];
});

// Tab list classes
const tabListClasses = computed(() => {
  return ["tabs__list"];
});

// Indicator position (animated underline)
const indicatorStyles = computed(() => {
  if (props.vertical || props.variant !== "underline" || props.fill) return {};

  const activeTab = tabRefs.value[activeIndex.value];
  if (!activeTab) return {};

  return {
    width: `${activeTab.offsetWidth}px`,
    transform: `translateX(${activeTab.offsetLeft}px)`,
  };
});

// ---------- Methods ----------

function isActive(index) {
  return index === activeIndex.value;
}

function selectTab(index) {
  const tab = props.tabs[index];
  if (!tab || tab.disabled) return;

  emit("update:modelValue", tab.value);
  emit("change", { tab, index });
}

function getTabId(index) {
  return `tab-${index}`;
}

function getPanelId(index) {
  return `tab-panel-${index}`;
}

function getTabClasses(index) {
  return [
    "tabs__tab",
    {
      "tabs__tab--active": isActive(index),
      "tabs__tab--disabled": props.tabs[index]?.disabled,
    },
  ];
}

function getPanelClasses(index) {
  return ["tabs__panel", { "tabs__panel--active": isActive(index) }];
}

function formatCount(count) {
  if (count > 99) return "99+";
  return String(count);
}

// ---------- Keyboard Navigation ----------

function handleKeydown(event) {
  const currentIndex = activeIndex.value;
  let nextIndex = null;

  const orientation = props.vertical ? "vertical" : "horizontal";
  const isHorizontal = orientation === "horizontal";

  const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";
  const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";

  switch (event.key) {
    case prevKey:
      event.preventDefault();
      nextIndex = getPrevEnabledTab(currentIndex);
      break;
    case nextKey:
      event.preventDefault();
      nextIndex = getNextEnabledTab(currentIndex);
      break;
    case "Home":
      event.preventDefault();
      nextIndex = getFirstEnabledTab();
      break;
    case "End":
      event.preventDefault();
      nextIndex = getLastEnabledTab();
      break;
    default:
      return;
  }

  if (nextIndex !== null && nextIndex !== currentIndex) {
    selectTab(nextIndex);
    tabRefs.value[nextIndex]?.focus();
  }
}

function getPrevEnabledTab(startIndex) {
  for (let i = startIndex - 1; i >= 0; i--) {
    if (!props.tabs[i]?.disabled) return i;
  }
  // Wrap to last
  for (let i = props.tabs.length - 1; i > startIndex; i--) {
    if (!props.tabs[i]?.disabled) return i;
  }
  return null;
}

function getNextEnabledTab(startIndex) {
  for (let i = startIndex + 1; i < props.tabs.length; i++) {
    if (!props.tabs[i]?.disabled) return i;
  }
  // Wrap to first
  for (let i = 0; i < startIndex; i++) {
    if (!props.tabs[i]?.disabled) return i;
  }
  return null;
}

function getFirstEnabledTab() {
  for (let i = 0; i < props.tabs.length; i++) {
    if (!props.tabs[i]?.disabled) return i;
  }
  return null;
}

function getLastEnabledTab() {
  for (let i = props.tabs.length - 1; i >= 0; i--) {
    if (!props.tabs[i]?.disabled) return i;
  }
  return null;
}
</script>

<style lang="scss" scoped>
// ============================================
// TABS WRAPPER
// ============================================

.tabs {
  display: flex;
  flex-direction: column;

  // Vertical layout
  &--vertical {
    flex-direction: row;

    .tabs__list {
      flex-direction: column;
      border-bottom: none;
      border-right: 1px solid $color-border-light;
    }

    .tabs__panels {
      flex: 1;
    }

    .tabs__tab {
      border-bottom: none;
      border-right: 2px solid transparent;

      &--active {
        border-right-color: $color-interactive-primary-default;
      }

      // Pills variant vertical
      .tabs--pills & {
        border-right: none;
        border-radius: $border-radius-standard;
        margin: 0 $spacing-scale-1;
      }
    }

    // Boxed variant vertical
    &.tabs--boxed .tabs__tab {
      border: 1px solid transparent;
      border-right: none;

      &--active {
        border-color: $color-border-light;
        border-right-color: $color-background-surface;
        margin-right: -1px;
      }
    }
  }

  // Alignment
  &--align-start .tabs__list {
    justify-content: flex-start;
  }

  &--align-center .tabs__list {
    justify-content: center;
  }

  &--align-end .tabs__list {
    justify-content: flex-end;
  }

  // Fill (full width)
  &--fill .tabs__tab {
    flex: 1;
  }
}

// ============================================
// TAB LIST
// ============================================

.tabs__list {
  display: flex;
  position: relative;
  border-bottom: 1px solid $color-border-light;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

// ============================================
// TAB BUTTON
// ============================================

.tabs__tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-scale-2;
  flex-shrink: 0;
  border: none;
  background: none;
  cursor: pointer;
  font-family: $typography-family-primary;
  color: $color-text-secondary;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    border-color 0.15s ease;
  white-space: nowrap;
  user-select: none;
  outline: none;

  // Size variants
  padding: $spacing-scale-3 $spacing-scale-4;
  font-size: $typography-size-body-small;
  font-weight: $typography-weight-medium;
  line-height: $typography-line-height-body-small;

  .tabs--sm & {
    padding: $spacing-scale-2 $spacing-scale-3;
    font-size: $typography-size-caption;
    line-height: $typography-line-height-caption;
  }

  .tabs--lg & {
    padding: $spacing-scale-4 $spacing-scale-6;
    font-size: $typography-size-body;
    line-height: $typography-line-height-body;
  }

  // Hover
  &:hover:not(:disabled) {
    color: $color-text-primary;
    background-color: transparent;
  }

  // Focus-visible
  &:focus-visible {
    outline: 2px solid $color-interactive-primary-default;
    outline-offset: -2px;
    border-radius: $border-radius-minimal;
  }

  // Active
  &--active {
    color: $color-text-primary;
  }

  // Disabled
  &:disabled,
  &--disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

// ---------- Underline Variant ----------

.tabs--underline {
  .tabs__tab {
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;

    &--active {
      border-bottom-color: $color-interactive-primary-default;
      color: $color-interactive-primary-default;
    }
  }

  // Animated indicator
  .tabs__indicator {
    position: absolute;
    bottom: -1px;
    left: 0;
    height: 2px;
    background-color: $color-interactive-primary-default;
    transition:
      transform 0.25s ease,
      width 0.25s ease;
    pointer-events: none;
  }
}

// ---------- Pills Variant ----------

.tabs--pills {
  .tabs__list {
    border-bottom: none;
    gap: $spacing-scale-1;
    padding: $spacing-scale-1;
  }

  .tabs__tab {
    border: none;
    border-radius: $border-radius-standard;
    margin: 0;
    padding: $spacing-scale-2 $spacing-scale-4;

    &:hover:not(:disabled) {
      background-color: $color-background-subtle;
    }

    &--active {
      background-color: $color-background-surface;
      color: $color-text-primary;
      box-shadow: $shadow-navigation;
    }
  }

  .tabs--sm .tabs__tab {
    padding: $spacing-scale-1 $spacing-scale-3;
  }

  .tabs--lg .tabs__tab {
    padding: $spacing-scale-3 $spacing-scale-5;
  }

  // Pills on dark
  .tabs__list {
    background-color: $color-background-subtle;
    border-radius: $border-radius-standard;
  }

  &.tabs--fill .tabs__list {
    display: flex;
  }
}

// ---------- Boxed Variant ----------

.tabs--boxed {
  .tabs__list {
    border-bottom: 1px solid $color-border-light;
    gap: 0;
  }

  .tabs__tab {
    border: 1px solid transparent;
    border-bottom: none;
    border-radius: $border-radius-standard $border-radius-standard 0 0;
    margin-bottom: -1px;

    &:hover:not(:disabled) {
      background-color: $color-background-subtle;
      border-color: $color-border-light;
    }

    &--active {
      background-color: $color-background-surface;
      border-color: $color-border-light;
      color: $color-text-primary;
    }
  }

  // Boxed fill
  &.tabs--fill .tabs__tab {
    border-radius: 0;

    &:first-child {
      border-radius: $border-radius-standard 0 0 0;
    }

    &:last-child {
      border-radius: 0 $border-radius-standard 0 0;
    }
  }
}

// ============================================
// TAB ICON
// ============================================

.tabs__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;

  .tabs--sm & {
    width: 14px;
    height: 14px;
  }

  .tabs--lg & {
    width: 20px;
    height: 20px;
  }
}

// ============================================
// TAB LABEL
// ============================================

.tabs__label {
  overflow: hidden;
  text-overflow: ellipsis;
}

// ============================================
// TAB BADGE / COUNT
// ============================================

.tabs__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: $typography-weight-semibold;
  line-height: 1;
  color: $color-text-secondary;
  background-color: $color-background-subtle;
  border-radius: $border-radius-pill;
  flex-shrink: 0;

  .tabs__tab--active & {
    background-color: rgba($color-interactive-primary-default, 0.1);
    color: $color-interactive-primary-default;
  }

  .tabs--sm & {
    min-width: 16px;
    height: 16px;
    font-size: 10px;
    padding: 0 4px;
  }
}

// ============================================
// PANELS
// ============================================

.tabs__panels {
  flex: 1;
}

.tabs__panel {
  padding: $spacing-scale-4 0 0;

  &:focus-visible {
    outline: 2px solid $color-interactive-primary-default;
    outline-offset: -2px;
    border-radius: $border-radius-minimal;
  }

  &[hidden] {
    display: none;
  }
}

// ============================================
// RESPONSIVE
// ============================================

@media (max-width: 639px) {
  .tabs:not(.tabs--vertical) {
    .tabs__list {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .tabs__tab {
      flex-shrink: 0;
    }

    &.tabs--fill .tabs__tab {
      flex: 1 0 auto;
      min-width: fit-content;
    }
  }

  .tabs--vertical {
    flex-direction: column;

    .tabs__list {
      flex-direction: row;
      overflow-x: auto;
      border-right: none;
      border-bottom: 1px solid $color-border-light;
    }

    .tabs__tab {
      border-right: none;
      border-bottom: 2px solid transparent;

      &--active {
        border-bottom-color: $color-interactive-primary-default;
      }
    }
  }
}
</style>
