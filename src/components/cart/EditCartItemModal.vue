<script setup>
import { computed, ref, watch } from 'vue'
import BaseModal from '../../shared/ui/modals/BaseModal.vue'
import { ApiError } from '../../shared/api/errors'
import { getMarketplaceProductPricingTable } from '../../modules/catalog/api'
import ConfigOptionButton from '../product/ConfigOptionButton.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  item: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save'])

const loading = ref(false)
const message = ref('')
const platformName = ref('')
const schema = ref([])
const rows = ref([])
const selected = ref({})

function toFiniteNumber(value) {
  const numericValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

const activeRows = computed(() => (
  Array.isArray(rows.value)
    ? rows.value.filter((row) => typeof row?.sellingPrice === 'number')
    : []
))

function getSchemaField(key) {
  return Array.isArray(schema.value) ? schema.value.find((f) => f?.key === key) : null
}

function formatOptionLabel(key, value) {
  const field = getSchemaField(key)
  if (field && Array.isArray(field.options)) {
    const found = field.options.find((opt) => String(opt.value) === String(value))
    if (found?.label) return found.label
  }
  return String(value)
}

function getVariantValue(variant, key) {
  const value = variant?.attributeValues?.[key]
  return value === undefined || value === null ? '' : String(value)
}

function getAttributeOptions(key) {
  const field = getSchemaField(key)
  if (field && Array.isArray(field.options) && field.options.length > 0) {
    return field.options.map((opt) => ({
      value: String(opt.value),
      label: opt.label
    }))
  }

  const allowedValues = Array.from(new Set(
    activeRows.value
      .map((row) => row?.attributeValues?.[key])
      .filter((value) => value !== undefined && value !== null)
      .map((value) => String(value))
  ))

  return allowedValues.map((value) => ({ value, label: formatOptionLabel(key, value) }))
}

const fields = computed(() => (
  Array.isArray(schema.value)
    ? schema.value.map((f) => ({
        ...f,
        options: getAttributeOptions(f.key),
        selectedValue: String(selected.value?.[f.key] ?? '')
      }))
    : []
))

function isOptionAvailable(key, value) {
  const candidateValue = String(value)
  const currentSelections = selected.value || {}

  return activeRows.value.some((row) => {
    if (getVariantValue(row, key) !== candidateValue) return false
    return Object.entries(currentSelections).every(([selectionKey, selectionValue]) => {
      if (selectionKey === key || !selectionValue) return true
      return getVariantValue(row, selectionKey) === String(selectionValue)
    })
  })
}

function selectOption(key, value) {
  selected.value = { ...selected.value, [key]: String(value) }
}

const currentVariant = computed(() => (
  activeRows.value.find((variant) => (
    fields.value.every((f) => getVariantValue(variant, f.key) === String(selected.value?.[f.key] ?? ''))
  )) || null
))

function normalizeSelection() {
  if (!activeRows.value.length) {
    selected.value = {}
    return
  }

  const initial = props.item?.pricingAttributes && typeof props.item.pricingAttributes === 'object'
    ? props.item.pricingAttributes
    : {}

  const next = {}
  for (const f of fields.value) {
    const candidate = initial?.[f.key]
    next[f.key] = candidate == null ? '' : String(candidate)
  }
  selected.value = next

  if (currentVariant.value) return
  const first = activeRows.value[0]
  selected.value = fields.value.reduce((acc, f) => {
    acc[f.key] = getVariantValue(first, f.key)
    return acc
  }, {})
}

async function loadPricing() {
  const productId = String(props.item?.productId || '')
  if (!productId) return

  loading.value = true
  message.value = ''
  platformName.value = ''
  schema.value = []
  rows.value = []

  try {
    const res = await getMarketplaceProductPricingTable(productId)
    if (!res.data) {
      message.value = 'Sản phẩm chưa có bảng giá khả dụng.'
      return
    }
    platformName.value = String(res.data.platformName || '')
    schema.value = Array.isArray(res.data.schema) ? res.data.schema : []
    rows.value = (Array.isArray(res.data.items) ? res.data.items : []).map((row) => {
      const sellingPrice = toFiniteNumber(row?.sellingPrice)
      const referencePrice =
        row?.referencePrice === null || row?.referencePrice === undefined
          ? null
          : toFiniteNumber(row?.referencePrice)
      return {
        ...row,
        sellingPrice: sellingPrice ?? null,
        referencePrice: referencePrice ?? null,
      }
    })
  } catch (err) {
    if (err instanceof ApiError) message.value = err.message || 'Không tải được bảng giá.'
    else if (err instanceof Error) message.value = err.message || 'Không tải được bảng giá.'
    else message.value = 'Không tải được bảng giá.'
  } finally {
    loading.value = false
  }
}

function close() {
  emit('close')
}

function save() {
  if (!currentVariant.value) return

  const pricingAttributes = Object.fromEntries(
    fields.value.map((f) => [f.key, String(selected.value?.[f.key] ?? '')])
  )

  const configuration = {
    'Nền tảng': platformName.value || 'N/A',
    ...Object.fromEntries(fields.value.map((f) => [
      f.label,
      formatOptionLabel(f.key, String(selected.value?.[f.key] ?? ''))
    ]))
  }

  emit('save', {
    price: currentVariant.value.sellingPrice,
    configuration,
    pricingAttributes
  })
}

watch(() => props.open, (value) => {
  if (!value) return
  void loadPricing().then(() => normalizeSelection())
})

watch(activeRows, () => {
  if (!props.open) return
  normalizeSelection()
}, { deep: true })
</script>

<template>
  <BaseModal :open="open" title="Sửa cấu hình trong giỏ" @close="close">
    <div v-if="loading" class="muted">Đang tải bảng giá...</div>
    <div v-else-if="message" class="err">{{ message }}</div>

    <div v-else class="wrap">
      <div class="title">{{ item?.title }}</div>
      <div class="muted sub">{{ item?.artist }}</div>

      <div v-if="fields.length" class="groups">
        <div v-for="f in fields" :key="f.key" class="field">
          <div class="label">{{ f.label }}</div>
          <div class="seg option-row">
            <ConfigOptionButton
              v-for="opt in f.options"
              :key="`${f.key}:${opt.value}`"
              variant="seg"
              :active="f.selectedValue === String(opt.value)"
              :disabled="!isOptionAvailable(f.key, opt.value)"
              @click="selectOption(f.key, opt.value)"
            >{{ opt.label }}</ConfigOptionButton>
          </div>
        </div>
      </div>

      <div class="price">
        <span class="muted">Giá</span>
        <b>{{ typeof currentVariant?.sellingPrice === 'number' ? currentVariant.sellingPrice.toLocaleString('vi-VN') + ' ₫' : 'Chưa có giá' }}</b>
      </div>
    </div>

    <template #footer>
      <button class="btn btn-ghost" type="button" @click="close">Hủy</button>
      <button class="btn btn-primary" type="button" :disabled="!currentVariant" @click="save">Lưu thay đổi</button>
    </template>
  </BaseModal>
</template>

<style scoped>
.wrap {
  display: flex;
  flex-direction: column;
}
.title {
  font-weight: 900;
  letter-spacing: -0.02em;
}
.sub {
  margin-top: 2px;
  font-size: 13px;
}
.groups {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.field {
  padding: 0;
}
.label {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--c-text-soft);
  margin-bottom: 8px;
}
.option-row {
  flex-wrap: wrap;
  gap: 10px;
  overflow: visible;
  padding: 6px;
  background: linear-gradient(180deg, #f7fafc, #eef4fb);
  border: none;
  border-radius: 999px;
  justify-content: center;
}
.seg.option-row {
  border: none;
}
.option-row :deep(.seg-btn) {
  flex: 1 1 0;
  min-height: 42px;
  min-width: 0;
  padding: 10px 16px;
  border: 1px solid transparent;
  background: #fff;
  border-radius: 999px;
  color: #27364b;
  text-align: center;
}
.price {
  margin-top: 16px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  background: #fff;
}
.price b {
  color: var(--c-blue-700);
  font-size: 16px;
  font-variant-numeric: tabular-nums;
}
.err {
  padding: 12px 14px;
  border: 1px solid #fecaca;
  background: #fff1f2;
  color: #b91c1c;
  border-radius: var(--radius-md);
  font-size: 13px;
}
</style>

