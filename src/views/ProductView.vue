<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  getProduct,
  getProductDescriptionPdfUrl,
  getMarketplaceProductPricingTable,
  listRelatedProductsByAuthor,
} from '../modules/catalog/api'
import { consumePrefetchedProduct } from '../modules/catalog/productPrefetch'
import { ApiError } from '../shared/api/errors'
import ErrorState from '../shared/ui/states/ErrorState.vue'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../modules/auth/auth.store'
import { hasClientPermission } from '../modules/auth/auth.capabilities'
import ProductGrid from '../pages/market/components/ProductGrid.vue'
import ConfigOptionButton from '../components/product/ConfigOptionButton.vue'
import WaveBars from '../components/ui/WaveBars.vue'
import CheckList from '../components/ui/CheckList.vue'
import ProductDescriptionPdfWebView from '../components/documents/ProductDescriptionPdfWebView.vue'
import { getApiBaseUrl } from '../shared/api/http'
import ConfirmModal from '../shared/ui/modals/ConfirmModal.vue'

const defaultDeliverables = [
  'Bản thu âm chất lượng cao (WAV 24-bit/48kHz)',
  'Beat chuẩn & Instrumental',
  'Giấy chứng nhận bản quyền số (Digital Certificate)',
  'Hợp đồng cấp phép định dạng PDF ký số'
]

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()

const productId = computed(() => String(route.params.id || ''))
const product = ref(null)
const isLoading = ref(true)
const isNotFound = ref(false)
const loadError = ref(null)
let loadSeq = 0

const errorRequestId = computed(() => (loadError.value instanceof ApiError ? loadError.value.requestId : null))
const errorMessage = computed(() => {
  if (!loadError.value) return ''
  if (loadError.value instanceof ApiError) return loadError.value.message
  if (loadError.value instanceof Error) return loadError.value.message
  return 'Không thể tải dữ liệu'
})

const selectedPricingValues = ref({})

const productAuthorName = computed(
  () => product.value?.authorName || product.value?.artist?.displayName || 'Nghệ sĩ',
)
const productGenres = computed(() => {
  if (Array.isArray(product.value?.genres) && product.value.genres.length > 0) {
    return product.value.genres
  }
  if (product.value?.genre) return [product.value.genre]
  return []
})
const primaryGenre = computed(() => productGenres.value[0] || 'Khác')
const productDurationSeconds = computed(() => {
  if (typeof product.value?.duration === 'number') return product.value.duration
  if (typeof product.value?.durationSeconds === 'number') return product.value.durationSeconds
  return 0
})
const productCreatedAt = computed(
  () => product.value?.createdAt || product.value?.updatedAt || '',
)
const useCases = computed(() => (
  Array.isArray(product.value?.useCases) ? product.value.useCases : []
))
const allowedPermissions = computed(() => (
  Array.isArray(product.value?.allowedPermissions) ? product.value.allowedPermissions : []
))
const buyerCanManageOrder = computed(() => hasClientPermission({
  isAuthenticated: auth.isAuthenticated,
  roles: auth.roles,
  currentUser: auth.currentUser,
  me: auth.me,
}, 'manage_order'))
const pricingPlatform = ref(null)
const pricingSchema = ref([])
const pricingTableRows = ref([])
const pricingWarnings = ref([])
const pricingMessage = ref('')
const pricingErrorRequestId = ref('')
const pricingLoading = ref(false)
const pricingErrorApiBaseUrl = ref('')
const activePricingRows = computed(() => (
  pricingTableRows.value.filter((row) => (
    typeof row.sellingPrice === 'number'
  ))
))

function getPricingSchema(key) {
  if (!Array.isArray(pricingSchema.value)) return null
  return pricingSchema.value.find((item) => item.key === key) || null
}

function formatPricingOptionLabel(key, rawValue) {
  if (key === 'is_exclusive') {
    return String(rawValue) === 'true' ? 'Có' : 'Không'
  }

  if (key === 'view_target') {
    const numericValue = Number(rawValue)
    if (Number.isNaN(numericValue)) return String(rawValue)
    if (numericValue === 1000000) return '1M'
    if (numericValue >= 1000 && numericValue % 1000 === 0) {
      return `${numericValue / 1000}K`
    }
    return String(numericValue)
  }

  if (key === 'duration') {
    if (String(rawValue) === 'one_year') return '1 năm'
    if (String(rawValue) === 'one_month') return '1 tháng'
  }

  return String(rawValue)
}

function getAttributeOptions(key) {
  const schema = getPricingSchema(key)
  const allowedValues = Array.from(new Set(
    activePricingRows.value
      .map((row) => row?.attributeValues?.[key])
      .filter((value) => value !== undefined && value !== null)
      .map((value) => String(value)),
  ))

  const options = Array.isArray(schema?.options) ? schema.options : []
  if (options.length > 0) {
    return options.map((option) => ({
      value: String(option.value),
      label: option.label,
    }))
  }

  return allowedValues.map((value) => ({
    value,
    label: formatPricingOptionLabel(key, value),
  }))
}

function getSelectedOption(options, value) {
  return options.find((option) => String(option.value) === String(value)) || null
}

const pricingFields = computed(() => (
  Array.isArray(pricingSchema.value)
    ? pricingSchema.value.map((field) => ({
        ...field,
        options: getAttributeOptions(field.key),
        selectedValue: String(selectedPricingValues.value?.[field.key] ?? ''),
      }))
    : []
))

function getVariantValue(variant, key) {
  const value = variant?.attributeValues?.[key]
  return value === undefined || value === null ? '' : String(value)
}

function isOptionAvailable(key, value) {
  const candidateValue = String(value)
  const currentSelections = selectedPricingValues.value || {}

  return activePricingRows.value.some((row) => {
    if (getVariantValue(row, key) !== candidateValue) return false

    return Object.entries(currentSelections).every(([selectionKey, selectionValue]) => {
      if (selectionKey === key || !selectionValue) return true
      return getVariantValue(row, selectionKey) === selectionValue
    })
  })
}

function selectPricingOption(key, value) {
  selectedPricingValues.value = {
    ...selectedPricingValues.value,
    [key]: String(value),
  }
}

function getClosestVariant() {
  if (!activePricingRows.value.length) return null

  let bestVariant = activePricingRows.value[0]
  let bestScore = -1

  for (const variant of activePricingRows.value) {
    let score = 0
    for (const field of pricingFields.value) {
      if (getVariantValue(variant, field.key) === String(selectedPricingValues.value?.[field.key] ?? '')) {
        score += 1
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestVariant = variant
    }
  }

  return bestVariant
}

const currentVariant = computed(() => (
  activePricingRows.value.find((variant) => (
    pricingFields.value.every((field) => (
      getVariantValue(variant, field.key) === String(selectedPricingValues.value?.[field.key] ?? '')
    ))
  )) || null
))

function normalizeVariantSelection() {
  if (!activePricingRows.value.length) {
    selectedPricingValues.value = {}
    return
  }

  const bestVariant = currentVariant.value || getClosestVariant()
  if (!bestVariant) return

  selectedPricingValues.value = pricingFields.value.reduce((result, field) => {
    result[field.key] = getVariantValue(bestVariant, field.key)
    return result
  }, {})
}

const hasPricingOptions = computed(() => activePricingRows.value.length > 0)
const visiblePricingWarnings = computed(() => (
  pricingWarnings.value.filter((warning) => {
    const normalized = String(warning).toLowerCase()
    return !(
      normalized.includes('legacy') ||
      normalized.includes('variant cũ') ||
      normalized.includes('schema hiện tại') ||
      normalized.includes('tự đồng bộ') ||
      normalized.includes('bị gộp')
    )
  })
))
const priceUnavailableMessage = computed(() => {
  if (pricingLoading.value) {
    return 'Đang tải bảng giá sản phẩm...'
  }
  if (pricingMessage.value) {
    return pricingMessage.value
  }
  if (pricingPlatform.value) {
    return 'Sản phẩm chưa có biến thể đang bán.'
  }
  return 'Sản phẩm chưa có bảng giá khả dụng.'
})

const audioElement = ref(null)
const isPlaying = ref(false)
const progress = ref(0)

function togglePlay() {
  const url = product.value?.previewAudioUrl || product.value?.audioUrl
  if (!url) {
    alert("Bản nghe thử không có sẵn cho tác phẩm này.")
    return
  }

  if (!audioElement.value) {
    audioElement.value = new Audio(url)
    audioElement.value.addEventListener('timeupdate', () => {
      const duration = audioElement.value.duration
      if (duration && !isNaN(duration) && isFinite(duration)) {
        progress.value = (audioElement.value.currentTime / duration) * 100
      }
    })
    audioElement.value.addEventListener('ended', () => {
      isPlaying.value = false
      progress.value = 0
    })
   
  }

  if (isPlaying.value) {
    audioElement.value.pause()
    isPlaying.value = false
  } else {
    audioElement.value.play().then(() => {
      isPlaying.value = true
    }).catch(err => {
      console.error('Playback failed:', err)
      alert("Không thể phát nhạc: " + err.message)
      isPlaying.value = false
    })
  }
}

onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.src = ''
    audioElement.value = null
  }
})

const peaks = computed(() => (product.value?.samplePeak || []).map(v => v / 60))

const descriptionPdfUrl = ref('')
const descriptionPdfLoading = ref(false)
const descriptionPdfError = ref(false)

function resetPricingState() {
  pricingPlatform.value = null
  pricingSchema.value = []
  pricingTableRows.value = []
  pricingWarnings.value = []
  pricingMessage.value = ''
  pricingErrorRequestId.value = ''
  pricingErrorApiBaseUrl.value = ''
  pricingLoading.value = false
}

function toFiniteNumber(value) {
  const numericValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

async function loadPricingData(seq) {
  pricingLoading.value = true
  pricingMessage.value = ''
  pricingWarnings.value = []
  pricingErrorRequestId.value = ''
  pricingErrorApiBaseUrl.value = ''

  try {
    const pricingRes = await getMarketplaceProductPricingTable(productId.value)
    if (seq !== loadSeq) return

    if (!pricingRes.data) {
      pricingMessage.value = 'Sản phẩm chưa có bảng giá khả dụng để giao dịch.'
      pricingPlatform.value = null
      pricingSchema.value = []
      pricingTableRows.value = []
      return
    }

    pricingPlatform.value = {
      platformType: pricingRes.data.platformType,
      platformName: pricingRes.data.platformName,
    }
    pricingSchema.value = Array.isArray(pricingRes.data.schema) ? pricingRes.data.schema : []
    const normalizedItems = (Array.isArray(pricingRes.data.items) ? pricingRes.data.items : []).map((row) => {
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
    pricingTableRows.value = normalizedItems
    pricingWarnings.value = Array.isArray(pricingRes.data.warnings) ? pricingRes.data.warnings : []
  } catch (err) {
    if (seq !== loadSeq) return
    pricingPlatform.value = null
    pricingSchema.value = []
    pricingTableRows.value = []
    pricingWarnings.value = []

    if (err instanceof ApiError) {
      pricingErrorRequestId.value = err.requestId || ''
      pricingErrorApiBaseUrl.value = getApiBaseUrl()
      if (err.statusCode === 404) {
        pricingMessage.value =
          'API bảng giá marketplace chưa có trên server (404). Cần cập nhật/restart musica-api để có endpoint bảng giá public.'
      } else {
        pricingMessage.value = err.message || 'Không tải được bảng giá sản phẩm.'
      }
    } else if (err instanceof Error) {
      pricingMessage.value = err.message || 'Không tải được bảng giá sản phẩm.'
    } else {
      pricingMessage.value = 'Không tải được bảng giá sản phẩm.'
    }
  } finally {
    if (seq !== loadSeq) return
    pricingLoading.value = false
  }
}

const calcData = computed(() => {
  if (!pricingPlatform.value || !currentVariant.value) return null

  const attributeBreakdown = pricingFields.value.map((field) => {
    const selectedValue = String(selectedPricingValues.value?.[field.key] ?? '')
    const selectedOption = getSelectedOption(field.options || [], selectedValue)
    return {
      label: field.label,
      value: selectedOption?.label || formatPricingOptionLabel(field.key, selectedValue),
    }
  })

  return {
    subtotal: currentVariant.value.sellingPrice,
    referencePrice: currentVariant.value.referencePrice,
    currency: currentVariant.value.currency,
    breakdown: [
      { label: 'Nền tảng', value: pricingPlatform.value.platformName },
      ...attributeBreakdown,
      ...(typeof currentVariant.value.referencePrice === 'number'
        ? [{ label: 'Giá tham chiếu', value: formatVND(currentVariant.value.referencePrice) }]
        : []),
      ...(currentVariant.value.updatedAt
        ? [{ label: 'Cập nhật', value: formatDate(currentVariant.value.updatedAt) }]
        : []),
    ],
    summary: {
      'Nền tảng': pricingPlatform.value.platformName,
      ...Object.fromEntries(attributeBreakdown.map((item) => [item.label, item.value])),
    },
  }
})

watch(activePricingRows, () => {
  normalizeVariantSelection()
}, { immediate: true })

watch(selectedPricingValues, () => {
  if (hasPricingOptions.value && !currentVariant.value) {
    normalizeVariantSelection()
  }
}, { deep: true })

const related = ref([])

const addedFlash = ref(false)
const duplicateCartModalOpen = ref(false)
function getSelectedUsageRights() {
  return allowedPermissions.value
    .map((item) => String(item?.id || '').trim())
    .filter((value) => value.length > 0)
}

function getSelectedPricingAttributes() {
  return Object.fromEntries(
    pricingFields.value.map((field) => [
      field.key,
      String(selectedPricingValues.value?.[field.key] ?? ''),
    ]),
  )
}

function ensureManageOrderPermission() {
  auth.hydrate()

  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return false
  }

  if (!buyerCanManageOrder.value) {
    alert('Tài khoản Buyer hiện không có quyền thao tác đơn hàng.')
    return false
  }

  return true
}

function addToCart() {
  if (!product.value || !calcData.value) return false
  if (!ensureManageOrderPermission()) return false
  const result = cart.add({
    productId: product.value.id,
    title: product.value.title,
    artist: productAuthorName.value,
    cover: product.value.thumbnailUrl,
    price: calcData.value.subtotal,
    configuration: calcData.value.summary,
    selectedUsageRights: getSelectedUsageRights(),
    pricingAttributes: getSelectedPricingAttributes(),
  })
  if (!result?.ok) {
    duplicateCartModalOpen.value = true
    return false
  }
  addedFlash.value = true
  setTimeout(() => addedFlash.value = false, 1400)
  return true
}

function buyNow() {
  if (!addToCart()) return
  setTimeout(() => router.push('/cart'), 200)
}

async function loadData() {
  const seq = (loadSeq += 1)
  isLoading.value = true
  isNotFound.value = false
  loadError.value = null
  product.value = null
  related.value = []
  resetPricingState()

  descriptionPdfLoading.value = false
  descriptionPdfError.value = false
  descriptionPdfUrl.value = ''

  try {
    const prefetched = consumePrefetchedProduct(productId.value)
    if (prefetched) {
      product.value = prefetched
    } else {
      const pRes = await getProduct(productId.value)
      if (seq !== loadSeq) return
      product.value = pRes.data
    }

    void loadPricingData(seq)

    try {
      const relRes = await listRelatedProductsByAuthor({
        productId: productId.value,
        limit: 4,
      })
      if (seq !== loadSeq) return
      related.value = (relRes.data.items || []).filter(
        (it) => String(it.id) !== String(productId.value),
      )
    } catch {
      if (seq !== loadSeq) return
      related.value = []
    }

    descriptionPdfLoading.value = true
    descriptionPdfError.value = false
    descriptionPdfUrl.value = ''
    try {
      const pdfRes = await getProductDescriptionPdfUrl(productId.value)
      if (seq !== loadSeq) return
      descriptionPdfUrl.value = pdfRes.data.descriptionPdfUrl || ''
    } catch {
      if (seq !== loadSeq) return
      descriptionPdfError.value = true
    } finally {
      if (seq !== loadSeq) return
      descriptionPdfLoading.value = false
    }
  } catch (err) {
    if (seq !== loadSeq) return
    if (
      err instanceof ApiError &&
      (err.statusCode === 404 || String(err.code).toUpperCase().includes('NOT_FOUND'))
    ) {
      isNotFound.value = true
    } else if (err instanceof Error && err.message === 'NOT_FOUND') {
      isNotFound.value = true
    } else {
      loadError.value = err instanceof Error ? err : new Error('Không thể tải dữ liệu')
    }
  } finally {
    if (seq !== loadSeq) return
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})

watch(() => route.params.id, () => {
  selectedPricingValues.value = {}
  loadData()
})

function formatDate(s) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatTime(pct, durationSecs) {
  if (!durationSecs || typeof durationSecs !== 'number' || isNaN(pct) || isNaN(durationSecs)) return '0:00'
  const cur = Math.floor(durationSecs * pct / 100)
  if (isNaN(cur)) return '0:00'
  return `${Math.floor(cur / 60)}:${String(cur % 60).padStart(2, '0')}`
}
function formatDuration(secs) {
  if (!secs) return '0:00'
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
}
function formatVND(amount) {
  if (!amount) return '0 đ'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}
</script>

<template>
  <div v-if="isNotFound" class="not-found container">
    <h2>Không tìm thấy tác phẩm</h2>
    <RouterLink class="btn btn-primary" to="/">Quay lại trang chủ</RouterLink>
  </div>

  <div v-else-if="loadError" class="container" style="padding: 28px 0;">
    <ErrorState
      title="Không thể tải tác phẩm"
      :message="errorMessage"
      :request-id="errorRequestId"
      :can-retry="true"
      @retry="loadData"
    />
  </div>

  <div v-else-if="!product" class="container" style="padding: 28px 0;" />

  <div v-else class="product-page">
    <div class="container crumbs">
      <RouterLink to="/">Trang chủ</RouterLink>
      <span>›</span>
      <RouterLink to="/" class="muted">{{ primaryGenre.toUpperCase() }}</RouterLink>
      <span>›</span>
      <span class="muted">{{ product.title }}</span>
    </div>

    <section class="hero-product">
      <div class="container product-grid">
        <div class="left">
          <div class="left-sticky">
            <div class="player-card">
              <div class="player-row">
                <div class="art" :style="{ backgroundImage: product.thumbnailUrl ? `url(${product.thumbnailUrl})` : 'none', backgroundColor: '#e5e7eb', backgroundSize: 'cover' }" aria-hidden="true">
                  <button class="play" @click="togglePlay" :aria-label="isPlaying ? 'Tạm dừng' : 'Phát'">
                    <svg v-if="!isPlaying" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                  </button>
                </div>
                <div class="meta-block">
                  <div class="title-row">
                    <span class="badge-cat">{{ primaryGenre.toUpperCase() }}</span>
                  </div>
                  <h1>{{ product.title }}</h1>
                  <p class="byline">{{ productAuthorName }}</p>
                  <div class="wave-line flex-1">
                    <WaveBars :peaks="peaks" :bars="80" size="md" variant="muted" :progress="progress" />
                    <span class="time">{{ formatTime(progress, productDurationSeconds) }} <em>/ {{ formatDuration(productDurationSeconds) }}</em></span>
                  </div>
                </div>
              </div>
              <div class="meta-row">
                <div><span>Nền tảng</span><b>{{ pricingPlatform?.platformName || 'Marketplace' }}</b></div>
                <div><span>Thể loại</span><b>{{ primaryGenre }}</b></div>
                <div><span>Phát hành</span><b>{{ formatDate(productCreatedAt) }}</b></div>
                <div><span>Thời lượng</span><b>{{ formatDuration(productDurationSeconds) }}</b></div>
              </div>
            </div>

            <div class="info-block">
              <h3>Nội dung tác quyền bao gồm</h3>
              <p class="muted">Khi mua tác quyền, nghệ sĩ sẽ bàn giao đầy đủ các tài sản số sau đây kèm hợp đồng:</p>
              <CheckList :items="defaultDeliverables" />
            </div>
          </div>
        </div>

        <aside class="right">
          <div class="config-card">
            <div class="config-head">
              <h2>Cấu hình tác quyền</h2>
              <p class="muted">
                Dữ liệu biến thể và giá được đọc từ bảng giá sản phẩm.
              </p>
            </div>

            <div v-if="hasPricingOptions" class="field-group">
              <div v-for="field in pricingFields" :key="field.key" class="field">
                <label class="field-label">{{ field.label }}</label>
                <div class="seg option-row">
                  <ConfigOptionButton
                    v-for="option in field.options"
                    :key="`${field.key}:${option.value}`"
                    variant="seg"
                    :active="field.selectedValue === String(option.value)"
                    :disabled="!isOptionAvailable(field.key, option.value)"
                    @click="selectPricingOption(field.key, option.value)"
                  >{{ option.label }}</ConfigOptionButton>
                </div>
              </div>
            </div>
            <div v-else class="pricing-empty">
              {{ priceUnavailableMessage }}
              <div v-if="pricingErrorRequestId" class="muted">RequestId: {{ pricingErrorRequestId }}</div>
              <div v-if="pricingErrorApiBaseUrl" class="muted">API Base URL: {{ pricingErrorApiBaseUrl }}</div>
            </div>

            <div v-if="visiblePricingWarnings.length > 0" class="pricing-warning-list">
              <div v-for="warning in visiblePricingWarnings" :key="warning" class="pricing-warning">
                {{ warning }}
              </div>
            </div>

            <div class="price-summary">
              <div class="ps-total">
                <span>Tạm tính</span>
                <transition name="price">
                  <strong v-if="calcData" :key="calcData.subtotal" class="gradient-text">{{ formatVND(calcData.subtotal) }}</strong>
                </transition>
                <span v-if="!calcData" class="muted">Chưa có giá khả dụng</span>
              </div>
              <div v-if="calcData" class="price-breakdown">
                <div v-for="item in calcData.breakdown" :key="item.label" class="price-breakdown__row">
                  <span>{{ item.label }}</span>
                  <b>{{ item.value }}</b>
                </div>
              </div>
              <small class="muted">Chưa gồm phí xử lý 4% & VAT. Hợp đồng số phát hành ngay sau thanh toán.</small>
            </div>

            <div class="actions">
              <button class="btn btn-primary btn-lg" :disabled="!calcData" @click="buyNow">Tiến hành mua tác quyền</button>
              <button class="btn btn-ghost btn-lg" :disabled="!calcData" @click="addToCart">
                <span v-if="!addedFlash">Thêm vào giỏ</span>
                <span v-else>✓ Đã thêm</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <ConfirmModal
      :open="duplicateCartModalOpen"
      title="Sản phẩm đã tồn tại"
      message="Sản phẩm số với cấu hình này đã tồn tại trong giỏ hàng."
      confirm-text="Xem giỏ hàng"
      cancel-text="Đóng"
      @close="duplicateCartModalOpen = false"
      @confirm="() => { duplicateCartModalOpen = false; router.push('/cart') }"
    />

    <section class="section-tight product-details">
      <div class="container">
        <div class="info-block">
          <h3>Về tác phẩm</h3>
          <p class="desc">{{ product.description || 'Chưa có mô tả cho tác phẩm này.' }}</p>
          <div v-if="descriptionPdfLoading" class="doc-loading">Đang tải file mô tả...</div>
          <ProductDescriptionPdfWebView
            v-else-if="descriptionPdfUrl"
            title="Mô tả tác phẩm (PDF)"
            :url="descriptionPdfUrl"
          />
          <div v-else-if="descriptionPdfError" class="doc-empty">Chưa thể tải file mô tả PDF.</div>
        </div>

        <div class="info-block">
          <h3>Quyền sở hữu & xác minh</h3>
          <ul class="ownership">
            <li><span>Tác giả</span><b>{{ productAuthorName }}</b></li>
            <li><span>Ngày đăng ký</span><b>{{ formatDate(productCreatedAt) }}</b></li>
            <li><span>Trạng thái</span><b class="ok">✓ Đã xác minh trên MusicA</b></li>
            <li v-if="allowedPermissions.length > 0"><span>Quyền cho phép</span><b>{{ allowedPermissions.map(item => item.name).join(', ') }}</b></li>
            <li v-if="useCases.length > 0"><span>Tình huống sử dụng</span><b>{{ useCases.join(', ') }}</b></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Related -->
    <section v-if="related.length > 0" class="section related">
      <div class="container">
        <div class="related-grid-wrap">
          <div class="section-head reveal">
            <div>
              <h2>Tác phẩm bạn có thể thích</h2>
            </div>
          </div>
          <div class="reveal">
            <ProductGrid :items="related" />
          </div>
        </div>
      </div>
    </section>
  </div>

</template>

<style scoped>
.not-found { padding: 120px 0; text-align: center; }

.crumbs { padding: 22px 0 8px; display: flex; gap: 8px; align-items: center; font-size: 13px; color: var(--c-text-soft); }
.crumbs a { color: var(--c-blue-700); }
.crumbs .muted { color: var(--c-text-mute); }
.doc-tile {
  width: 100%;
  margin-top: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--c-border);
  background: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  text-align: left;
  font: inherit;
  transition: border-color .2s var(--ease-out), box-shadow .2s var(--ease-out), transform .2s var(--ease-out);
}

.doc-tile:hover {
  border-color: var(--c-blue-300);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.doc-tile__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(31, 109, 240, 0.12);
  font-size: 18px;
}

.doc-tile__title {
  font-weight: 900;
  letter-spacing: -0.01em;
}

.doc-tile__sub {
  margin-top: 2px;
  font-size: 13px;
  color: var(--c-text-soft);
  font-weight: 600;
}

.hero-product { padding: 18px 0 16px; }
.product-details { padding: 28px 0 40px; }
.product-grid {
  display: grid;
  grid-template-columns: 1.25fr 0.9fr;
  gap: 32px;
  align-items: stretch;
}
@media (max-width: 980px) { .product-grid { grid-template-columns: 1fr; } }

/* ---------- Compact player card ---------- */
.player-card {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.player-row {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 18px;
  padding: 18px;
}
.art {
  position: relative;
  width: 130px; height: 130px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.art::after {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(100% 60% at 0% 100%, rgba(0,0,0,0.18), transparent 60%);
}
.play {
  position: relative;
  z-index: 1;
  width: 44px; height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.92);
  color: var(--c-blue-700);
  border: none;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-md);
  transition: transform .25s var(--ease-out);
}
.play:hover { transform: scale(1.08); }
.play.active { animation: pulseRing 2s infinite; }

.meta-block { min-width: 0; }
.title-row { display: flex; align-items: center; gap: 8px; }
.badge-cat {
  background: var(--c-blue-50);
  color: var(--c-blue-700);
  padding: 3px 8px;
  border-radius: var(--radius-full);
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.isrc {
  font-size: 11px;
  color: var(--c-text-mute);
  letter-spacing: 0.04em;
}
.meta-block h1 {
  font-size: clamp(20px, 2.6vw, 28px);
  margin: 8px 0 2px;
  font-weight: 800;
  letter-spacing: -0.02em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.byline { margin: 0 0 12px; color: var(--c-text-soft); font-size: 13px; }

.wave-line {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  width: 100%;
}
.wave-line .wb { flex: 1; }
.time {
  font-size: 11.5px;
  color: var(--c-text-soft);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.time em { color: var(--c-text-mute); font-style: normal; }

.meta-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--c-border);
  background: var(--c-bg-soft);
}
.meta-row > div {
  padding: 10px 16px;
  border-right: 1px solid var(--c-border);
}
.meta-row > div:last-child { border-right: none; }
.meta-row span { display: block; font-size: 10.5px; color: var(--c-text-mute); text-transform: uppercase; letter-spacing: 0.08em; }
.meta-row b { font-size: 13px; }

.info-block {
  margin-top: 18px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding: 20px 22px;
}
.info-block h3 { margin: 0 0 10px; font-size: 15.5px; }
.info-block p { margin: 0 0 8px; color: var(--c-text-soft); line-height: 1.65; font-size: 14px; }
.info-block p.muted { color: var(--c-text-mute); font-size: 13px; margin-bottom: 14px; }
.desc { white-space: pre-wrap; }
.doc-loading,
.doc-empty {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--c-border);
  background: var(--c-bg-soft);
  color: var(--c-text-mute);
  font-weight: 600;
  font-size: 13px;
}

.ownership { list-style: none; padding: 0; margin: 0; }
.ownership li {
  display: flex; justify-content: space-between; gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed var(--c-border);
  font-size: 13.5px;
}
.ownership li:last-child { border-bottom: none; }
.ownership li span { color: var(--c-text-mute); }
.ownership li b.ok { color: var(--c-teal-600); }

/* ---------- Config card ---------- */
.right { position: relative; }
.left-sticky { position: sticky; top: 100px; }
.left-sticky .info-block { margin-top: 18px; }
.config-card {
  background: #fff;
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-md);
}
.config-head h2 { margin: 8px 0 8px; font-size: 19px; letter-spacing: -0.01em; }
.config-head .muted { margin: 0 0 16px; font-size: 13px; line-height: 1.6; }
.field {
  margin-bottom: 16px;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
}
.field-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #24364d;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}
.option-row {
  flex-wrap: wrap;
  gap: 10px;
  overflow: visible;
  padding: 6px;
  background: linear-gradient(180deg, #f7fafc, #eef4fb);
  border: none;
  border-radius: 999px;
  scrollbar-width: none;
  justify-content: center;
}
.option-row::-webkit-scrollbar {
  display: none;
}
.option-row::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.45);
  border-radius: 999px;
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
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: border-color .22s ease, color .22s ease, background .22s ease, box-shadow .22s ease, transform .22s ease;
  text-align: center;
}
.option-row :deep(.seg-btn:hover:not(.disabled)) {
  border-color: rgba(45, 212, 191, 0.55);
  color: #0f766e;
  transform: translateY(-1px);
}
.option-row :deep(.seg-btn.active) {
  border-color: var(--c-teal-500);
  color: #0f766e;
  background: linear-gradient(180deg, #ecfeff, #ffffff);
  box-shadow: 0 8px 18px rgba(20, 184, 166, 0.16);
}
.option-row :deep(.seg-btn.disabled) {
  opacity: 0.5;
  cursor: not-allowed;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: none;
}
.pricing-empty,
.pricing-warning {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  font-size: 12.5px;
  line-height: 1.6;
}
.pricing-empty {
  border: 1px solid var(--c-border);
  background: var(--c-bg-soft);
  color: var(--c-text-soft);
}
.pricing-warning-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pricing-warning {
  border: 1px solid rgba(245, 158, 11, 0.25);
  background: rgba(245, 158, 11, 0.08);
  color: #92400e;
}
.price-breakdown {
  margin: 12px 0 8px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--c-border);
  background: var(--c-bg-soft);
}
.price-breakdown__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12.5px;
  padding: 6px 0;
}
.price-breakdown__row + .price-breakdown__row {
  border-top: 1px dashed var(--c-border);
}
.price-breakdown__row span { color: var(--c-text-soft); }
.price-breakdown__row b { font-size: 12.5px; }

.purpose-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.ptile {
  text-align: left;
  padding: 12px;
  background: #fff;
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-md);
  transition: border-color .25s, background .25s, transform .25s, box-shadow .25s;
}
.ptile:hover { border-color: var(--c-blue-300); transform: translateY(-2px); }
.ptile.active {
  border-color: var(--c-teal-500);
  background: linear-gradient(180deg, #f3fdfa, #ffffff);
  box-shadow: 0 8px 24px rgba(20,184,166,0.18);
}
.picon {
  width: 32px; height: 32px;
  border-radius: 9px;
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 8px;
  color: #fff;
}
.picon.yt { background: #ef4444; }
.picon.perf { background: var(--grad-brand); }
.ptile strong { display: block; font-size: 13.5px; }
.ptile span { display: block; font-size: 11.5px; color: var(--c-text-mute); margin-top: 2px; line-height: 1.45; }

.field-group { animation: rise .35s var(--ease-out); }
.swap-enter-active, .swap-leave-active { transition: opacity .25s, transform .25s; }
.swap-enter-from { opacity: 0; transform: translateY(8px); }
.swap-leave-to { opacity: 0; transform: translateY(-8px); }

.toggle-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px;
  background: var(--c-bg-soft);
  border-radius: var(--radius-md);
  border: 1px solid var(--c-border);
}
.toggle {
  position: relative;
  width: 42px; height: 24px;
  border-radius: var(--radius-full);
  background: var(--c-border-strong);
  border: none;
  flex-shrink: 0;
  transition: background .25s;
}
.toggle .dot {
  position: absolute;
  top: 3px; left: 3px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: var(--shadow-xs);
  transition: transform .3s var(--ease-out);
}
.toggle.active { background: var(--grad-brand); }
.toggle.active .dot { transform: translateX(18px); }
.toggle-text strong { display: block; font-size: 13px; }
.toggle-text span { display: block; font-size: 11.5px; color: var(--c-text-mute); margin-top: 1px; }

.seg {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background: var(--c-bg-soft);
  padding: 4px;
  border-radius: var(--radius-full);
  border: 1px solid var(--c-border);
}
.seg.option-row {
  border: none;
}
.seg-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 12.5px;
  color: var(--c-text-soft);
  transition: background .25s, color .25s, box-shadow .25s;
  min-width: max-content;
}
.seg-btn:hover { color: var(--c-text); }
.seg-btn.active {
  background: #fff;
  color: var(--c-blue-700);
  box-shadow: var(--shadow-xs);
}

.big-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 10px;
  background: #fff;
  border: 1px solid var(--c-border-strong);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 12.5px;
  color: var(--c-text);
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
}
.big-card:hover { border-color: rgba(20, 184, 166, 0.65); }
.big-card.active {
  border-color: var(--c-teal-500);
  color: var(--c-teal-700);
  background: linear-gradient(180deg, #f0fdfa, #ffffff);
}
.big-card .icon { color: var(--c-text-mute); transition: color 0.2s; }
.big-card.active .icon { color: var(--c-teal-600); }

.scale-list { display: flex; flex-direction: column; gap: 6px; }
.scale-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-md);
  text-align: left;
  transition: border-color .25s, background .25s;
}
.scale-row:hover { border-color: var(--c-blue-300); }
.scale-row.active {
  border-color: var(--c-teal-500);
  background: linear-gradient(180deg, #f3fdfa, #ffffff);
}
.scale-radio {
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 2px solid var(--c-border-strong);
  position: relative;
  flex-shrink: 0;
  transition: border-color .25s;
}
.scale-row.active .scale-radio { border-color: var(--c-teal-500); }
.scale-row.active .scale-radio::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--c-teal-500);
}
.scale-body { flex: 1; }
.scale-body strong { display: block; font-size: 13.5px; }
.scale-body span { display: block; font-size: 11.5px; color: var(--c-text-mute); margin-top: 1px; }
.scale-mult {
  font-weight: 800;
  color: var(--c-blue-700);
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
}

.counter {
  display: flex;
  align-items: stretch;
  background: var(--c-bg-soft);
  border-radius: var(--radius-full);
  border: 1px solid var(--c-border);
  padding: 4px;
}
.counter button {
  width: 36px;
  border: none;
  background: #fff;
  border-radius: var(--radius-full);
  font-size: 16px;
  font-weight: 700;
  color: var(--c-blue-700);
  transition: background .2s;
}
.counter button:hover { background: var(--c-blue-50); }
.counter-val {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  font-size: 15px;
  gap: 4px;
}
.counter-val small { font-size: 11.5px; color: var(--c-text-mute); font-weight: 500; }

.price-summary {
  margin-top: 16px;
  padding: 12px 14px;
  background: linear-gradient(180deg, var(--c-blue-50), #fff);
  border: 1px solid var(--c-blue-100);
  border-radius: var(--radius-md);
}
.ps-total {
  position: relative;
  min-height: 28px;
  display: flex; justify-content: space-between; align-items: baseline;
  margin-top: 10px; padding-top: 10px;
  border-top: 1px dashed var(--c-blue-100);
}
.ps-total span { font-size: 12.5px; color: var(--c-text-soft); font-weight: 600; }
.ps-total strong { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }

.price-enter-active, .price-leave-active { transition: opacity .25s, transform .25s; position: absolute; right: 0; }
.price-enter-from { opacity: 0; transform: translateY(6px); }
.price-leave-to { opacity: 0; transform: translateY(-6px); }

.muted { color: var(--c-text-mute); font-size: 11.5px; display: block; margin-top: 6px; }

.actions {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-top: 16px;
}
.actions .btn {
  flex: 1;
  min-width: 0;
}

.micro-trust {
  margin-top: 14px;
  display: flex; flex-wrap: wrap; gap: 4px 14px;
  font-size: 11px;
  color: var(--c-text-mute);
  justify-content: center;
}

.related-grid-wrap {
  width: calc(100% - 280px);
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 980px) {
  .right { position: static; }
  .left-sticky { position: static; }
}
@media (max-width: 1100px) {
  .related-grid-wrap {
    width: calc(100% - 250px);
    max-width: none;
  }
}
@media (max-width: 900px) {
  .related-grid-wrap {
    width: 100%;
  }
}
@media (max-width: 560px) {
  .player-row { grid-template-columns: 100px 1fr; gap: 14px; padding: 14px; }
  .art { width: 100px; height: 100px; }
  .meta-row > div { padding: 8px 12px; }
  .actions { flex-direction: column; }
}
</style>
