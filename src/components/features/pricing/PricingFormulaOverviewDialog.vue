<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import type {
  PricingFormulaAttribute,
  PricingFormulaAttributeOption,
  PricingFormulaOverview,
} from '../../../modules/pricing/types'

const props = defineProps<{
  visible: boolean
  formulaOverview: PricingFormulaOverview | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const selectedValues = ref<Record<string, string>>({})

const resetSelections = () => {
  const formulaOverview = props.formulaOverview
  if (!formulaOverview) {
    selectedValues.value = {}
    return
  }

  selectedValues.value = formulaOverview.attributes.reduce<Record<string, string>>((result, attribute) => {
    result[attribute.key] = attribute.defaultValue
    return result
  }, {})
}

watch(
  () => props.formulaOverview,
  () => {
    resetSelections()
  },
  { immediate: true },
)

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      resetSelections()
    }
  },
)

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

const formatPercentage = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value)

const resolveSelectedOption = (attribute: PricingFormulaAttribute): PricingFormulaAttributeOption | null => {
  const selectedValue = selectedValues.value[attribute.key] ?? attribute.defaultValue
  return attribute.options.find((option) => option.value === selectedValue) ?? attribute.options[0] ?? null
}

const attributeSelections = computed(() =>
  (props.formulaOverview?.attributes ?? []).map((attribute) => ({
    attribute,
    option: resolveSelectedOption(attribute),
  })),
)

const attributeCoefficient = computed(() =>
  attributeSelections.value.reduce((result, item) => result * (item.option?.coefficient ?? 1), 1),
)

const finalPrice = computed(() => Math.round((props.formulaOverview?.basePrice ?? 0) * attributeCoefficient.value))

const isDefaultSelection = computed(() =>
  attributeSelections.value.every((item) => (item.option?.value ?? '') === item.attribute.defaultValue),
)

const updateSelection = (attributeKey: string, value: string) => {
  selectedValues.value = {
    ...selectedValues.value,
    [attributeKey]: value,
  }
}

const closeDialog = () => emit('update:visible', false)
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    class="w-[calc(100vw-0.75rem)] sm:w-[min(900px,96vw)]"
    :draggable="false"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
      <div class="flex min-w-0 flex-col gap-1">
        <div class="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--admin-primary-600)]">
          Bảng giá biến thể
        </div>
        <div class="text-lg font-bold text-[color:var(--admin-text)]">
          Công thức tính giá
        </div>
      </div>
    </template>

    <div v-if="formulaOverview" class="space-y-6 bg-[color:#F5F7FA] p-1 sm:p-2">
      <div class="flex flex-col gap-4 rounded-[20px] bg-[color:#0B1E3A] px-5 py-5 text-white shadow-sm">
        <div class="flex flex-wrap items-baseline gap-2 font-mono text-sm font-medium sm:text-[15px]">
          <span class="text-[color:#9FC2F2]">Lương cơ sở Việt Nam</span>
          <span class="text-white/40">×</span>
          <span class="text-[color:#F4C28A]">Hệ số nền tảng {{ formulaOverview.platformName }}</span>
          <span class="text-white/40">×</span>
          <span class="text-[color:#B9E6CF]">Tích hệ số thuộc tính</span>
          <span class="text-white/40">=</span>
          <span>Giá biến thể</span>
        </div>

        <div class="border-t border-white/10 pt-3 text-sm text-white/80">
          {{ formulaOverview.expressionLabel }}
        </div>

        <div class="space-y-2 border-t border-white/10 pt-3 text-xs text-white/80">
          <div class="flex items-start gap-2">
            <span class="mt-1 h-2 w-2 rounded-full bg-[color:#9FC2F2]" />
            <span><b class="font-semibold text-white">Lương cơ sở</b> — mức cố định theo quy định hiện hành</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="mt-1 h-2 w-2 rounded-full bg-[color:#F4C28A]" />
            <span><b class="font-semibold text-white">Hệ số nền tảng</b> — tỷ lệ cố định áp dụng cho {{ formulaOverview.platformName }}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="mt-1 h-2 w-2 rounded-full bg-[color:#B9E6CF]" />
            <span><b class="font-semibold text-white">Hệ số thuộc tính</b> — tích của các hệ số theo từng thuộc tính đang bật</span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-xl border border-[color:#D9DFE9] bg-white px-4 py-2 text-sm font-semibold text-[color:#13315C] transition hover:bg-[color:#E8EFF8]"
          @click="resetSelections"
        >
          <i class="pi pi-refresh mr-2" />
          Đặt lại mặc định
        </button>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between gap-4 rounded-xl border border-[color:#D9DFE9] bg-white px-4 py-4 shadow-sm">
          <div class="flex min-w-0 items-center gap-3">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[color:#E8EFF8] font-mono text-[11px] font-medium text-[color:#13315C]">1</span>
            <div>
              <p class="text-sm font-semibold text-[color:#10141C]">Lương cơ sở Việt Nam</p>
              <p class="text-xs text-[color:#4A5468]">Mức cố định, không chỉnh sửa</p>
            </div>
          </div>
          <div class="font-mono text-sm font-semibold text-[color:#0B1E3A]">
            {{ formatCurrency(formulaOverview.baseSalary) }}
          </div>
        </div>

        <div class="py-1 text-center font-mono text-sm text-[color:#A8B2C2]">×</div>

        <div class="flex items-center justify-between gap-4 rounded-xl border border-[color:#D9DFE9] bg-white px-4 py-4 shadow-sm">
          <div class="flex min-w-0 items-center gap-3">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[color:#E8EFF8] font-mono text-[11px] font-medium text-[color:#13315C]">2</span>
            <div>
              <p class="text-sm font-semibold text-[color:#10141C]">Hệ số nền tảng</p>
              <p class="text-xs text-[color:#4A5468]">Tỷ lệ cố định áp dụng cho {{ formulaOverview.platformName }}</p>
            </div>
          </div>
          <div class="font-mono text-sm font-semibold text-[color:#0B1E3A]">
            {{ formatPercentage(formulaOverview.platformRate) }}
          </div>
        </div>

        <div class="py-1 text-center font-mono text-sm text-[color:#A8B2C2]">×</div>

        <div class="rounded-[16px] border border-[color:#D9DFE9] bg-[color:#E8EFF8] p-4">
          <p class="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[color:#13315C]">
            Hệ số phụ thuộc thuộc tính
          </p>

          <div class="space-y-2">
            <div
              v-for="(item, index) in attributeSelections"
              :key="item.attribute.key"
              class="flex flex-col gap-3 rounded-xl border border-[color:#D9DFE9] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="flex min-w-0 items-center gap-3">
                <span class="flex h-6 min-w-6 items-center justify-center rounded-full border border-[color:#D9DFE9] bg-white font-mono text-[11px] font-medium text-[color:#13315C]">
                  {{ `3${String.fromCharCode(97 + index)}` }}
                </span>
                <div>
                  <p class="text-sm font-semibold text-[color:#10141C]">{{ item.attribute.label }}</p>
                </div>
              </div>

              <div class="relative w-full sm:w-auto">
                <select
                  :value="item.option?.value ?? item.attribute.defaultValue"
                  class="h-11 w-full appearance-none rounded-xl border border-[color:#D9DFE9] bg-white px-4 pr-10 text-sm font-medium text-[color:#10141C] outline-none transition focus:border-[color:#1F4E8C] focus:ring-2 focus:ring-[color:rgb(31_78_140/0.12)] sm:min-w-[260px]"
                  @change="updateSelection(item.attribute.key, ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="option in item.attribute.options" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
                <i class="pi pi-chevron-down pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[color:#4A5468]" />
              </div>

              <div class="flex items-center justify-between gap-4 sm:justify-end">
                <div class="text-xs text-[color:#4A5468]">Hệ số</div>
                <div class="font-mono text-sm font-semibold text-[color:#0B1E3A]">
                  × {{ (item.option?.coefficient ?? 1).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-[18px] border border-[color:#D9DFE9] bg-white px-5 py-4 shadow-sm">
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.12em] text-[color:#4A5468]">
              Giá biến thể
            </p>
            <p class="mt-1 text-sm text-[color:#4A5468]">
              {{ isDefaultSelection ? 'Theo cấu hình mặc định' : 'Theo lựa chọn tuỳ chỉnh' }}
            </p>
          </div>
          <div class="font-mono text-xl font-bold text-[color:#0B1E3A]">
            {{ formatCurrency(finalPrice) }}
          </div>
        </div>
      </div>
    </div>

    <div v-else class="rounded-xl border border-dashed bg-[color:var(--admin-surface-0)] px-6 py-10 text-center text-sm text-[color:var(--admin-text-muted)] [border-color:var(--admin-border)]">
      Chưa có dữ liệu công thức.
    </div>

    <template #footer>
      <div class="flex w-full justify-end">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg border bg-[color:var(--admin-surface-0)] px-4 py-2 text-sm font-semibold text-[color:var(--admin-text)] transition [border-color:var(--admin-border)] hover:bg-[color:var(--admin-surface-1)]"
          @click="closeDialog"
        >
          Đóng
        </button>
      </div>
    </template>
  </Dialog>
</template>

