<template>
  <div class="table-wrapper">
    <!-- Table toolbar (filters, search, bulk actions) -->
    <div v-if="$slots.toolbar || showBulkActions" class="table-toolbar">
      <div class="table-toolbar__left">
        <!-- Bulk actions -->
        <template v-if="showBulkActions">
          <span class="table-toolbar__selected-count">
            {{ selectedRows.length }} selected
          </span>
          <slot name="bulk-actions" :selected="selectedRows" />
        </template>
        <slot name="toolbar-left" />
      </div>
      <div class="table-toolbar__right">
        <slot name="toolbar-right" />
      </div>
    </div>

    <!-- Scrollable container -->
    <div
      class="table-container"
      :class="{ 'table-container--loading': loading }"
    >
      <table
        class="table"
        :class="tableClasses"
        role="table"
        :aria-label="ariaLabel"
        :aria-busy="loading"
      >
        <!-- Header -->
        <thead class="table__head">
          <tr class="table__row" role="row">
            <!-- Checkbox column -->
            <th
              v-if="selectable"
              class="table__header table__header--checkbox"
              scope="col"
            >
              <AppCheckbox
                :id="`${tableId}-select-all`"
                :model-value="isAllSelected"
                :indeterminate="isIndeterminate"
                :aria-label="
                  isAllSelected ? 'Deselect all rows' : 'Select all rows'
                "
                @update:model-value="toggleSelectAll"
              />
            </th>

            <!-- Data columns -->
            <th
              v-for="column in columns"
              :key="column.key"
              class="table__header"
              :class="{
                'table__header--sortable': column.sortable,
                'table__header--sorted-asc':
                  sortKey === column.key && sortDirection === 'asc',
                'table__header--sorted-desc':
                  sortKey === column.key && sortDirection === 'desc',
                'table__header--right': column.align === 'right',
                'table__header--center': column.align === 'center',
                [`table__header--${column.width}`]: column.width,
              }"
              :style="column.width ? { width: column.width } : undefined"
              scope="col"
              :aria-sort="getAriaSort(column)"
              @click="column.sortable && toggleSort(column.key)"
            >
              <span class="table__header-content">
                {{ column.label }}
                <span
                  v-if="column.sortable"
                  class="table__sort-icon"
                  aria-hidden="true"
                >
                  <svg
                    v-if="sortKey !== column.key"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M6 2v8M3 5l3-3 3 3"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <svg
                    v-else-if="sortDirection === 'asc'"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M3 7.5l3-3 3 3"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <svg
                    v-else
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M3 4.5l3 3 3-3"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </span>
            </th>

            <!-- Actions column -->
            <th
              v-if="$slots.actions"
              class="table__header table__header--actions"
              scope="col"
            >
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody class="table__body">
          <!-- Loading skeleton -->
          <template v-if="loading">
            <tr
              v-for="i in skeletonRows"
              :key="`skeleton-${i}`"
              class="table__row"
              aria-hidden="true"
            >
              <td v-if="selectable" class="table__cell table__cell--skeleton">
                <span class="table__skeleton" />
              </td>
              <td
                v-for="column in columns"
                :key="column.key"
                class="table__cell table__cell--skeleton"
                :class="{
                  'table__cell--right': column.align === 'right',
                  'table__cell--center': column.align === 'center',
                }"
              >
                <span class="table__skeleton" />
              </td>
              <td
                v-if="$slots.actions"
                class="table__cell table__cell--skeleton"
              >
                <span class="table__skeleton table__skeleton--short" />
              </td>
            </tr>
          </template>

          <!-- Empty state -->
          <tr v-else-if="paginatedData.length === 0">
            <td class="table__empty" :colspan="totalColumns">
              <div class="table__empty-icon">
                <slot name="empty-icon">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="6"
                      y="10"
                      width="36"
                      height="28"
                      rx="4"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <path
                      d="M6 18h36"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                  </svg>
                </slot>
              </div>
              <p class="table__empty-title">
                <slot name="empty-title">{{ emptyTitle }}</slot>
              </p>
              <p v-if="emptyDescription || $slots['empty-description']">
                <slot name="empty-description">{{ emptyDescription }}</slot>
              </p>
              <div v-if="$slots['empty-actions']" class="table__empty-actions">
                <slot name="empty-actions" />
              </div>
            </td>
          </tr>

          <!-- Data rows -->
          <tr
            v-for="(row, index) in paginatedData"
            v-else
            :key="rowKey ? row[rowKey] : index"
            class="table__row"
            :class="{
              'table__row--hoverable': hoverable,
              'table__row--clickable': clickable,
              'table__row--selected': selectable && isSelected(row),
            }"
            @click="handleRowClick(row, $event)"
          >
            <!-- Checkbox -->
            <td
              v-if="selectable"
              class="table__cell table__cell--checkbox"
              @click.stop
            >
              <AppCheckbox
                :id="`${tableId}-row-${rowKey ? row[rowKey] : index}`"
                :model-value="isSelected(row)"
                :aria-label="`Select row ${index + 1}`"
                @update:model-value="toggleRow(row)"
              />
            </td>

            <!-- Data cells -->
            <td
              v-for="column in columns"
              :key="column.key"
              class="table__cell"
              :class="{
                'table__cell--right': column.align === 'right',
                'table__cell--center': column.align === 'center',
                'table__cell--primary': column.primary,
                'table__cell--truncate': column.truncate,
              }"
              :data-label="responsive ? column.label : undefined"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :value="getNestedValue(row, column.key)"
                :index="index"
              >
                {{ formatCellValue(getNestedValue(row, column.key), column) }}
              </slot>
            </td>

            <!-- Actions column -->
            <td
              v-if="$slots.actions"
              class="table__cell table__cell--actions"
              @click.stop
            >
              <slot name="actions" :row="row" :index="index" />
            </td>
          </tr>
        </tbody>

        <!-- Footer (summary row) -->
        <tfoot v-if="$slots.footer" class="table__foot">
          <slot name="footer" />
        </tfoot>
      </table>

      <!-- Loading overlay -->
      <div v-if="loading" class="table__loading-overlay" aria-hidden="true">
        <span class="table__loading-spinner" />
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="paginated && totalPages > 1" class="table-pagination">
      <div class="table-pagination__info">
        <slot name="pagination-info">
          Showing {{ startRange }}–{{ endRange }} of {{ totalItems }}
        </slot>
      </div>
      <div class="table-pagination__controls">
        <AppIconButton
          :aria-label="'Previous page'"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </AppIconButton>

        <template v-for="page in visiblePages" :key="page">
          <span v-if="page === '...'" class="table-pagination__ellipsis"
            >...</span
          >
          <button
            v-else
            class="table-pagination__page"
            :class="{ 'table-pagination__page--active': page === currentPage }"
            :aria-current="page === currentPage ? 'page' : undefined"
            :aria-label="`Page ${page}`"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </template>

        <AppIconButton
          :aria-label="'Next page'"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 3l5 5-5 5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </AppIconButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, useSlots } from "vue";
import AppCheckbox from "@/components/form/AppCheckbox.vue";
import AppIconButton from "@/components/button/AppIconButton.vue";

// ---------- Props ----------

const props = defineProps({
  // Data
  data: { type: Array, default: () => [] },
  columns: {
    type: Array,
    required: true,
    // Each column: { key, label, sortable?, align?, primary?, truncate?, width?, format? }
  },
  rowKey: { type: String, default: "id" },

  // Selection
  selectable: { type: Boolean, default: false },
  selected: { type: Array, default: () => [] },

  // Sorting
  sortable: { type: Boolean, default: false },
  defaultSortKey: { type: String, default: "" },
  defaultSortDirection: { type: String, default: "asc" },

  // Pagination
  paginated: { type: Boolean, default: false },
  pageSize: { type: Number, default: 10 },
  currentPageProp: { type: Number, default: 1 },

  // Behavior
  hoverable: { type: Boolean, default: true },
  clickable: { type: Boolean, default: false },
  responsive: { type: Boolean, default: true },

  // States
  loading: { type: Boolean, default: false },
  skeletonRows: { type: Number, default: 5 },

  // Empty state
  emptyTitle: { type: String, default: "No data found" },
  emptyDescription: { type: String, default: "" },

  // Accessibility
  ariaLabel: { type: String, default: "Data table" },
  tableId: { type: String, default: "table" },
});

// ---------- Emits ----------

const emit = defineEmits([
  "update:selected",
  "update:currentPage",
  "sort",
  "row-click",
  "page-change",
]);

// ---------- Slots ----------

const slots = useSlots();

// ---------- Computed ----------

const totalColumns = computed(() => {
  let count = props.columns.length;
  if (props.selectable) count++;
  if (slots.actions) count++;
  return count;
});

// ---- Sorting ----

const sortKey = ref(props.defaultSortKey);
const sortDirection = ref(props.defaultSortDirection);

const sortedData = computed(() => {
  if (!sortKey.value) return [...props.data];

  return [...props.data].sort((a, b) => {
    const aVal = getNestedValue(a, sortKey.value);
    const bVal = getNestedValue(b, sortKey.value);

    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    const comparison =
      typeof aVal === "string" ? aVal.localeCompare(String(bVal)) : aVal - bVal;

    return sortDirection.value === "asc" ? comparison : -comparison;
  });
});

// ---- Pagination ----

const currentPage = ref(props.currentPageProp);

watch(
  () => props.currentPageProp,
  (val) => {
    currentPage.value = val;
  },
);

const paginatedData = computed(() => {
  if (!props.paginated) return sortedData.value;

  const start = (currentPage.value - 1) * props.pageSize;
  const end = start + props.pageSize;
  return sortedData.value.slice(start, end);
});

const totalItems = computed(() => props.data.length);
const totalPages = computed(() => Math.ceil(totalItems.value / props.pageSize));
const startRange = computed(() =>
  totalItems.value === 0 ? 0 : (currentPage.value - 1) * props.pageSize + 1,
);
const endRange = computed(() =>
  Math.min(currentPage.value * props.pageSize, totalItems.value),
);

const visiblePages = computed(() => {
  const pages = [];
  const max = 7;
  const total = totalPages.value;

  if (total <= max) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage.value > 3) pages.push("...");
    const start = Math.max(2, currentPage.value - 1);
    const end = Math.min(total - 1, currentPage.value + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage.value < total - 2) pages.push("...");
    pages.push(total);
  }
  return pages;
});

// ---- Selection ----

const isAllSelected = computed(() => {
  if (paginatedData.value.length === 0) return false;
  return paginatedData.value.every((row) => isSelected(row));
});

const isIndeterminate = computed(() => {
  if (paginatedData.value.length === 0) return false;
  const selectedCount = paginatedData.value.filter((row) =>
    isSelected(row),
  ).length;
  return selectedCount > 0 && selectedCount < paginatedData.value.length;
});

const selectedRows = computed(() => props.selected);

const showBulkActions = computed(
  () => props.selectable && selectedRows.value.length > 0,
);

// ---------- Methods ----------

function getNestedValue(obj, path) {
  if (!path) return "";
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function formatCellValue(value, column) {
  if (value === null || value === undefined) return column.empty ?? "—";
  if (column.format) return column.format(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function isSelected(row) {
  if (!props.rowKey) return false;
  return props.selected.some((s) => s[props.rowKey] === row[props.rowKey]);
}

function toggleRow(row) {
  const updated = isSelected(row)
    ? props.selected.filter((s) => s[props.rowKey] !== row[props.rowKey])
    : [...props.selected, row];
  emit("update:selected", updated);
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    // Deselect all on current page
    const pageKeys = paginatedData.value.map((r) => r[props.rowKey]);
    const updated = props.selected.filter(
      (s) => !pageKeys.includes(s[props.rowKey]),
    );
    emit("update:selected", updated);
  } else {
    // Select all on current page (avoid duplicates)
    const existing = new Set(props.selected.map((s) => s[props.rowKey]));
    const toAdd = paginatedData.value.filter(
      (r) => !existing.has(r[props.rowKey]),
    );
    emit("update:selected", [...props.selected, ...toAdd]);
  }
}

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDirection.value = "asc";
  }
  emit("sort", { key: sortKey.value, direction: sortDirection.value });
}

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  emit("update:currentPage", page);
  emit("page-change", page);
}

function handleRowClick(row, event) {
  if (props.clickable) {
    emit("row-click", { row, event });
  }
}

function getAriaSort(column) {
  if (!column.sortable) return undefined;
  if (sortKey.value !== column.key) return "none";
  return sortDirection.value === "asc" ? "ascending" : "descending";
}
</script>

<style lang="scss" scoped>
// ---------- Wrapper ----------

.table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0;
}

// ---------- Toolbar ----------

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-scale-4;
  padding: $spacing-scale-4 $spacing-scale-6;
  background-color: $color-background-surface;
  border: 1px solid $color-border-light;
  border-bottom: none;
  border-radius: $border-radius-prominent $border-radius-prominent 0 0;
  flex-wrap: wrap;

  &__left,
  &__right {
    display: flex;
    align-items: center;
    gap: $spacing-scale-3;
  }

  &__selected-count {
    font-size: $typography-size-body-small;
    font-weight: $typography-weight-medium;
    color: $color-text-primary;
  }
}

// ---------- Container ----------

.table-container {
  position: relative;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid $color-border-light;

  .table-toolbar + & {
    border-top: none;
    border-radius: 0 0 $border-radius-prominent $border-radius-prominent;
  }

  &:not(:has(+ .table-toolbar)) {
    border-radius: $border-radius-prominent;
  }

  &--loading {
    min-height: 300px;
  }
}

// ---------- Base Table ----------

.table {
  width: 100%;
  border-collapse: collapse;
  font-family: $typography-family-primary;
  font-size: $typography-size-body-small;
  line-height: $typography-line-height-body-small;
  color: $color-text-primary;
  background-color: $color-background-surface;
}

// ---------- Header ----------

.table__head {
  border-bottom: 1px solid $color-border-light;
  background-color: $color-background-subtle;
  position: sticky;
  top: 0;
  z-index: 10;
}

.table__header {
  padding: $spacing-scale-3 $spacing-scale-4;
  font-size: $typography-size-caption;
  font-weight: $typography-weight-semibold;
  line-height: $typography-line-height-caption;
  color: $color-text-secondary;
  text-align: left;
  white-space: nowrap;
  user-select: none;

  &-content {
    display: inline-flex;
    align-items: center;
    gap: $spacing-scale-1;
  }

  &--sortable {
    cursor: pointer;
    transition: color 0.1s ease;

    &:hover {
      color: $color-text-primary;
    }
  }

  &--sorted-asc,
  &--sorted-desc {
    color: $color-interactive-primary-default;
  }

  &--right {
    text-align: right;
  }
  &--center {
    text-align: center;
  }
  &--checkbox {
    width: 48px;
    padding: $spacing-scale-3 $spacing-scale-3;
  }
  &--actions {
    width: 60px;
    text-align: right;
  }
}

.table__sort-icon {
  display: inline-flex;
  opacity: 0.5;
  flex-shrink: 0;
  color: currentColor;

  .table__header--sorted-asc &,
  .table__header--sorted-desc & {
    opacity: 1;
  }
}

// ---------- Body ----------

.table__body {
  .table__row {
    border-bottom: 1px solid $color-border-light;
    transition: background-color 0.1s ease;

    &:last-child {
      border-bottom: none;
    }

    &--hoverable:hover {
      background-color: $color-background-subtle;
    }

    &--clickable {
      cursor: pointer;

      &:hover {
        background-color: $color-background-blue-tint;
      }
    }

    &--selected {
      background-color: $color-background-blue-tint;
    }
  }
}

.table__cell {
  padding: $spacing-scale-3 $spacing-scale-4;
  vertical-align: middle;
  color: $color-text-primary;

  &--right {
    text-align: right;
  }
  &--center {
    text-align: center;
  }
  &--checkbox {
    width: 48px;
    padding: $spacing-scale-3;
  }
  &--actions {
    width: 60px;
    text-align: right;
  }

  &--primary {
    font-weight: $typography-weight-medium;
  }

  &--truncate {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// ---------- Skeleton Loading ----------

.table__cell--skeleton {
  padding: $spacing-scale-4;
}

.table__skeleton {
  display: block;
  height: 14px;
  width: 100%;
  background-color: $color-background-subtle;
  border-radius: $border-radius-minimal;
  animation: table-skeleton-pulse 1.5s ease-in-out infinite;

  &--short {
    width: 60%;
  }
}

@keyframes table-skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

// ---------- Loading Overlay ----------

.table__loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba($color-background-surface, 0.6);
  pointer-events: none;
}

.table__loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid $color-border-light;
  border-top-color: $color-interactive-primary-default;
  border-radius: $border-radius-circle;
  animation: table-spin 0.8s linear infinite;
}

@keyframes table-spin {
  to {
    transform: rotate(360deg);
  }
}

// ---------- Empty State ----------

.table__empty {
  padding: $spacing-scale-12 $spacing-scale-4;
  text-align: center;
  color: $color-text-secondary;

  &-icon {
    margin-block-end: $spacing-scale-4;
    color: $color-border-default;
    display: flex;
    justify-content: center;
  }

  &-title {
    font-weight: $typography-weight-semibold;
    color: $color-text-primary;
    margin-block-end: $spacing-scale-1;
  }

  &-actions {
    margin-block-start: $spacing-scale-6;
    display: flex;
    justify-content: center;
    gap: $spacing-scale-3;
  }
}

// ---------- Footer ----------

.table__foot {
  border-top: 2px solid $color-border-light;
  background-color: $color-background-subtle;

  .table__cell {
    font-weight: $typography-weight-semibold;
  }
}

// ---------- Pagination ----------

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-scale-4;
  padding: $spacing-scale-4 $spacing-scale-6;
  background-color: $color-background-surface;
  border: 1px solid $color-border-light;
  border-top: none;
  border-radius: 0 0 $border-radius-prominent $border-radius-prominent;
  flex-wrap: wrap;

  &__info {
    font-size: $typography-size-body-small;
    color: $color-text-secondary;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: $spacing-scale-1;
  }

  &__page {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: $spacing-scale-9;
    height: $spacing-scale-9;
    border: none;
    background: none;
    border-radius: $border-radius-standard;
    font-size: $typography-size-body-small;
    font-weight: $typography-weight-medium;
    color: $color-text-secondary;
    cursor: pointer;
    transition:
      background-color 0.1s ease,
      color 0.1s ease;

    &:hover {
      background-color: $color-background-subtle;
      color: $color-text-primary;
    }

    &--active {
      background-color: $color-interactive-primary-default;
      color: $color-white;

      &:hover {
        background-color: $color-interactive-primary-hover;
        color: $color-white;
      }
    }
  }

  &__ellipsis {
    width: $spacing-scale-9;
    text-align: center;
    color: $color-text-secondary;
  }
}

// ---------- Responsive (card fallback) ----------

@media (max-width: 639px) {
  .table--responsive {
    thead {
      display: none;
    }

    .table__row {
      display: block;
      padding: $spacing-scale-4;
      border-bottom: 1px solid $color-border-light;
    }

    .table__cell {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: $spacing-scale-2 0;
      border: none;

      &::before {
        content: attr(data-label);
        font-weight: $typography-weight-semibold;
        color: $color-text-secondary;
        margin-right: $spacing-scale-4;
        flex-shrink: 0;
      }

      &--primary {
        font-size: $typography-size-body;
        padding-bottom: $spacing-scale-2;

        &::before {
          display: none;
        }
      }

      &--checkbox,
      &--actions {
        justify-content: flex-end;

        &::before {
          display: none;
        }
      }
    }
  }
}
</style>
