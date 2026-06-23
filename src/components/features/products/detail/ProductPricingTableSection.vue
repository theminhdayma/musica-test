<script setup lang="ts">
import type { PricingAttributeSchema, PricingTableRow } from '../../../../modules/pricing/types'

type PricingTableDraft = {
  sellingPrice: string
  isActive: boolean
}

const props = withDefaults(
  defineProps<{
    schema: PricingAttributeSchema[]
    rows: PricingTableRow[]
    drafts: Record<string, PricingTableDraft>
    loading?: boolean
    saving?: boolean
    dirtyCount?: number
    canEdit?: boolean
  }>(),
  {
    loading: false,
    saving: false,
    dirtyCount: 0,
    canEdit: true,
  },
)

const emit = defineEmits<{
  refresh: []
  reset: []
  save: []
  updateSellingPrice: [payload: { key: string; value: string }]
  updateIsActive: [payload: { key: string; value: boolean }]
}>()

const formatPricingAttributeValue = (schema: PricingAttributeSchema, value: unknown) => {
  if (value === undefined || value === null) return 'Không có'
  if (schema.kind === 'boolean') return value === true ? 'Có' : 'Không'
  if (schema.kind === 'choice' || schema.kind === 'numeric-bucketed') {
    return schema.options?.find((item) => item.value === String(value))?.label ?? String(value)
  }
  return String(value)
}

const formatCurrency = (value: number | null) => {
  if (value === null) return 'Không khả dụng'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

const formatDateTime = (value: string | null) => {
  if (!value) return 'Chưa cập nhật'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed)
}

const getDraft = (row: PricingTableRow): PricingTableDraft =>
  props.drafts[row.key] ?? {
    sellingPrice: row.sellingPrice === null ? '' : String(row.sellingPrice),
    isActive: row.isActive,
  }
</script>

<template>
  <article class="rounded-[24px] border [border-color:var(--admin-border)] bg-[color:var(--admin-surface-0)] p-5 shadow-sm">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h3 class="text-sm font-bold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">Bảng giá theo biến thể</h3>
        <p class="mt-2 text-sm text-[color:var(--admin-text-muted)]">
          Hiển thị toàn bộ trường hợp mua có thể xảy ra. Nhập giá bán trực tiếp trên từng dòng và lưu theo lô.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-xl border bg-[color:var(--admin-surface-0)] px-4 py-2.5 text-sm font-semibold text-[color:var(--admin-text)] transition [border-color:var(--admin-border)] hover:bg-[color:var(--admin-surface-1)] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading || saving"
          @click="emit('refresh')"
        >
          <i class="pi pi-refresh mr-2" />
          Làm mới
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-xl border bg-[color:var(--admin-surface-0)] px-4 py-2.5 text-sm font-semibold text-[color:var(--admin-text)] transition [border-color:var(--admin-border)] hover:bg-[color:var(--admin-surface-1)] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading || saving || dirtyCount === 0"
          @click="emit('reset')"
        >
          Hoàn tác
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-xl bg-[color:var(--admin-primary-600)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--admin-primary-700)] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading || saving || !canEdit || dirtyCount === 0"
          @click="emit('save')"
        >
          <i class="pi pi-save mr-2" />
          {{ saving ? 'Đang lưu...' : `Lưu bảng giá${dirtyCount > 0 ? ` (${dirtyCount})` : ''}` }}
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="mt-4 rounded-xl border [border-color:var(--admin-border)] bg-[color:var(--admin-surface-1)] px-4 py-6 text-sm text-[color:var(--admin-text-muted)]"
    >
      Đang tải bảng giá...
    </div>

    <div
      v-else-if="rows.length === 0"
      class="mt-4 rounded-xl border border-dashed [border-color:var(--admin-border)] bg-[color:var(--admin-surface-1)] px-4 py-6 text-sm text-[color:var(--admin-text-muted)]"
    >
      Chưa có dòng bảng giá nào cho nền tảng này.
    </div>

    <div v-else class="mt-4 rounded-xl border [border-color:var(--admin-border)]">
      <table class="w-full table-fixed divide-y divide-border-subtle bg-[color:var(--admin-surface-0)]">
        <thead class="bg-[color:var(--admin-surface-1)]">
          <tr>
            <th
              v-for="column in schema"
              :key="column.key"
              class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]"
            >
              {{ column.label }}
            </th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">
              Giá gốc cơ bản
            </th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">
              Giá đang bán
            </th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">
              Đang bán
            </th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">
              Trạng thái
            </th>
            <th class="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">
              Cập nhật
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-border-subtle">
          <tr v-for="row in rows" :key="row.key" :class="row.isLegacy ? 'bg-[color:var(--admin-warning-50)]/35' : ''">
            <td
              v-for="column in schema"
              :key="`${row.key}-${column.key}`"
              class="break-words px-4 py-3 align-top text-sm text-[color:var(--admin-text)]"
            >
              {{ formatPricingAttributeValue(column, row.attributeValues[column.key]) }}
            </td>
            <td class="break-words px-4 py-3 align-top text-sm font-semibold text-[color:var(--admin-text)]">
              {{ formatCurrency(row.referencePrice) }}
            </td>
            <td class="px-4 py-3 align-top">
              <input
                :value="getDraft(row).sellingPrice"
                type="number"
                min="0"
                class="h-11 w-full min-w-0 rounded-xl border bg-[color:var(--admin-surface-0)] px-4 text-sm text-[color:var(--admin-text)] outline-none transition [border-color:var(--admin-border)] focus:[border-color:var(--admin-primary-500)] focus:ring-2 focus:ring-[color:var(--admin-ring)] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="!canEdit || saving"
                @input="emit('updateSellingPrice', { key: row.key, value: ($event.target as HTMLInputElement).value })"
              />
            </td>
            <td class="px-4 py-3 align-top text-sm text-[color:var(--admin-text)]">
              <label class="inline-flex items-center gap-2">
                <input
                  :checked="getDraft(row).isActive"
                  type="checkbox"
                  class="h-4 w-4 rounded [border-color:var(--admin-border)] text-[color:var(--admin-primary-600)] focus:ring-[color:var(--admin-ring)]"
                  :disabled="!canEdit || saving"
                  @change="emit('updateIsActive', { key: row.key, value: ($event.target as HTMLInputElement).checked })"
                />
                <span>{{ getDraft(row).isActive ? 'Bật' : 'Tắt' }}</span>
              </label>
            </td>
            <td class="px-4 py-3 align-top text-sm">
              <div class="flex flex-wrap gap-2">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  :class="
                    row.isConfigured
                      ? 'bg-[color:var(--admin-success-50)] text-[color:var(--admin-success-700)]'
                      : 'bg-[color:var(--admin-surface-1)] text-[color:var(--admin-text-muted)]'
                  "
                >
                  {{ row.isConfigured ? 'Đã cấu hình' : 'Chưa cấu hình' }}
                </span>
                <span
                  v-if="row.isLegacy"
                  class="inline-flex items-center rounded-full bg-[color:var(--admin-warning-50)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--admin-warning-700)]"
                >
                  Legacy
                </span>
              </div>
            </td>
            <td class="break-words px-4 py-3 align-top text-sm text-[color:var(--admin-text-muted)]">
              {{ formatDateTime(row.updatedAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>

