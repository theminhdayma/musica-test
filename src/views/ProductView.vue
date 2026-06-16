<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  getProduct,
  getProductDescriptionPdfUrl,
  getExpressionConfigs,
  getModificationConfigs,
  calculateVariantPricing,
  listRelatedProductsByAuthor,
} from '../modules/catalog/api'
import { toPublicProductId } from '../modules/catalog/idMap'
import { consumePrefetchedProduct } from '../modules/catalog/productPrefetch'
import { ApiError } from '../shared/api/errors'
import ErrorState from '../shared/ui/states/ErrorState.vue'
import { useCartStore } from '../stores/cart'
import MarketProductCard from '../pages/market/components/MarketProductCard.vue'
import ConfigOptionButton from '../components/product/ConfigOptionButton.vue'
import WaveBars from '../components/ui/WaveBars.vue'
import CheckList from '../components/ui/CheckList.vue'
import UserIcon from '../components/icon/UserIcon.vue'
import BuildingIcon from '../components/icon/BuildingIcon.vue'
import CalendarIcon from '../components/icon/CalendarIcon.vue'
import InfinityIcon from '../components/icon/InfinityIcon.vue'
import MonitorIcon from '../components/icon/MonitorIcon.vue'
import GlobeIcon from '../components/icon/GlobeIcon.vue'
import VideoIcon from '../components/icon/VideoIcon.vue'
import MegaphoneIcon from '../components/icon/MegaphoneIcon.vue'
import DiscIcon from '../components/icon/DiscIcon.vue'
import SlidersIcon from '../components/icon/SlidersIcon.vue'
import MusicIcon from '../components/icon/MusicIcon.vue'
import MicIcon from '../components/icon/MicIcon.vue'
import WaveIcon from '../components/icon/WaveIcon.vue'
import ProductDescriptionPdfWebView from '../components/documents/ProductDescriptionPdfWebView.vue'

const defaultDeliverables = [
  'Bản thu âm chất lượng cao (WAV 24-bit/48kHz)',
  'Beat chuẩn & Instrumental',
  'Giấy chứng nhận bản quyền số (Digital Certificate)',
  'Hợp đồng cấp phép định dạng PDF ký số'
]

const route = useRoute()
const router = useRouter()
const cart = useCartStore()

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
const expressionConfigs = ref([])
const modificationConfigs = ref([])

// Variant states
const platformType = ref('DIGITAL') // 'DIGITAL' | 'PHYSICAL'
const subjectType = ref(route.query.subject || 'INDIVIDUAL') // 'INDIVIDUAL' | 'ORGANIZATION'
const durationKey = ref(route.query.duration || 'ONE_YEAR') // 'ONE_YEAR' | 'PERPETUAL'
const scopeKey = ref(route.query.scope || 'SINGLE_CHANNEL') // 'SINGLE_CHANNEL' | 'MULTI_CHANNEL'
const selectedExpressionId = ref(route.query.expr || '')
const selectedModificationId = ref(route.query.mod || '')

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

// Price calculation from API
const calcData = ref(null)
const isCalculating = ref(false)

async function fetchCalculation() {
  if (!product.value) return
  if (platformType.value === 'DIGITAL' && !product.value.digitalRightConfigId) {
    calcData.value = null
    return
  }
  if (platformType.value === 'PHYSICAL' && !product.value.physicalRightConfigId) {
    calcData.value = null
    return
  }

  isCalculating.value = true
  try {
    const payload = {
      platformType: platformType.value,
      digitalRightConfigId: product.value.digitalRightConfigId,
      physicalRightConfigId: product.value.physicalRightConfigId,
      subject: subjectType.value,
      duration: durationKey.value,
      scope: scopeKey.value,
      expressionConfigId: selectedExpressionId.value || undefined,
      modificationConfigId: selectedModificationId.value || undefined
    }
    const res = await calculateVariantPricing(payload)
    calcData.value = {
      total: res.totalPrice,
      breakdown: res.breakdown.map(b => ({ label: b.label, value: null, isLine: true })), // the API doesn't return value per line but we show it
      summary: {
        'Nền tảng': platformType.value === 'DIGITAL' ? 'Kỹ thuật số' : 'Vật lý / Biểu diễn',
        'Đối tượng': subjectType.value === 'INDIVIDUAL' ? 'Cá nhân' : 'Tổ chức',
        'Thời hạn': durationKey.value === 'ONE_YEAR' ? '1 Năm' : 'Vĩnh viễn',
        'Phạm vi': scopeKey.value === 'SINGLE_CHANNEL' ? '1 Kênh' : 'Đa Kênh'
      }
    }
  } catch (err) {
    console.error('Pricing calculate error', err)
    calcData.value = null
  } finally {
    isCalculating.value = false
  }
}

watch([platformType, subjectType, durationKey, scopeKey, selectedExpressionId, selectedModificationId], () => {
  router.replace({
    query: {
      ...route.query,
      subject: subjectType.value,
      duration: durationKey.value,
      scope: scopeKey.value,
      expr: selectedExpressionId.value || undefined,
      mod: selectedModificationId.value || undefined
    }
  })
  fetchCalculation()
})

const related = ref([])

const addedFlash = ref(false)
function addToCart() {
  if (!product.value || !calcData.value) return
  cart.add({
    productId: product.value.id,
    title: product.value.title,
    artist: product.value.artist,
    cover: product.value.thumbnailUrl,
    price: calcData.value.total,
    configuration: calcData.value.summary
  })
  addedFlash.value = true
  setTimeout(() => addedFlash.value = false, 1400)
}

function buyNow() {
  addToCart()
  setTimeout(() => router.push('/cart'), 200)
}

async function loadData() {
  const seq = (loadSeq += 1)
  isLoading.value = true
  isNotFound.value = false
  loadError.value = null
  product.value = null
  related.value = []
  expressionConfigs.value = []
  modificationConfigs.value = []
  calcData.value = null

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

    const [expRes, modRes] = await Promise.all([
      getExpressionConfigs(),
      getModificationConfigs()
    ])
    if (seq !== loadSeq) return
    expressionConfigs.value = (expRes.items || []).filter(item => item.status === 'ACTIVE')
    modificationConfigs.value = (modRes.items || []).filter(item => item.status === 'ACTIVE')

    if (expressionConfigs.value.length > 0 && !selectedExpressionId.value) {
      selectedExpressionId.value = expressionConfigs.value[0].id
    }
    if (modificationConfigs.value.length > 0 && !selectedModificationId.value) {
      selectedModificationId.value = modificationConfigs.value[0].id
    }
    
    fetchCalculation()
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
  if (route.query.subject) subjectType.value = route.query.subject
  if (route.query.duration) durationKey.value = route.query.duration
  if (route.query.scope) scopeKey.value = route.query.scope
  if (route.query.expr) selectedExpressionId.value = route.query.expr
  if (route.query.mod) selectedModificationId.value = route.query.mod

  loadData()
})

watch(() => route.params.id, () => {
  platformType.value = 'DIGITAL'
  subjectType.value = 'INDIVIDUAL'
  durationKey.value = 'ONE_YEAR'
  scopeKey.value = 'SINGLE_CHANNEL'
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

const getIconForExpression = (name) => {
  const lower = name.toLowerCase()
  if (lower.includes('ca sĩ') || lower.includes('vocal')) return MicIcon
  if (lower.includes('không lời') || lower.includes('instrumental')) return WaveIcon
  if (lower.includes('vlog')) return VideoIcon
  if (lower.includes('quảng cáo') || lower.includes('quang cao') || lower.includes('ads')) return MegaphoneIcon
  return WaveIcon
}

const getIconForModification = (name) => {
  const lower = name.toLowerCase()
  if (lower.includes('nguyên bản') || lower.includes('nguyen ban')) return DiscIcon
  if (lower.includes('phối khí') || lower.includes('phoi khi')) return SlidersIcon
  return MusicIcon
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
      <RouterLink to="/" class="muted">{{ (product.genre || 'Khác').toUpperCase() }}</RouterLink>
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
                    <span class="badge-cat">{{ (product.genre || 'POP').toUpperCase() }}</span>
                  </div>
                  <h1>{{ product.title }}</h1>
                  <p class="byline">{{ product.authorName || 'Nghệ sĩ' }}</p>
                  <div class="wave-line flex-1">
                    <WaveBars :peaks="peaks" :bars="80" size="md" variant="muted" :progress="progress" />
                    <span class="time">{{ formatTime(progress, product.duration) }} <em>/ {{ formatDuration(product.duration) }}</em></span>
                  </div>
                </div>
              </div>
              <div class="meta-row">
                <div><span>Nền tảng</span><b>{{ product.digitalRightConfigId ? 'Kỹ thuật số' : 'Vật lý' }}</b></div>
                <div><span>Thể loại</span><b>{{ product.genre || 'Khác' }}</b></div>
                <div><span>Phát hành</span><b>{{ formatDate(product.createdAt) }}</b></div>
                <div><span>Thời lượng</span><b>{{ Math.floor((product.duration || 0) / 60) }}:{{ String((product.duration || 0) % 60).padStart(2, '0') }}</b></div>
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
            </div>

            <div class="field-group">
              <div class="field">
                <div class="big-cards">
                  <ConfigOptionButton
                    :active="subjectType === 'INDIVIDUAL'"
                    :icon="UserIcon"
                    @click="subjectType = 'INDIVIDUAL'"
                  >Cá nhân</ConfigOptionButton>
                  <ConfigOptionButton
                    :active="subjectType === 'ORGANIZATION'"
                    :icon="BuildingIcon"
                    @click="subjectType = 'ORGANIZATION'"
                  >Tổ chức</ConfigOptionButton>
                </div>
              </div>

              <div class="field">
                <div class="big-cards">
                  <ConfigOptionButton
                    :active="durationKey === 'ONE_YEAR'"
                    :icon="CalendarIcon"
                    @click="durationKey = 'ONE_YEAR'"
                  >1 Năm</ConfigOptionButton>
                  <ConfigOptionButton
                    :active="durationKey === 'PERPETUAL'"
                    :icon="InfinityIcon"
                    @click="durationKey = 'PERPETUAL'"
                  >Vĩnh viễn</ConfigOptionButton>
                </div>
              </div>

              <div class="field">
                <div class="big-cards">
                  <ConfigOptionButton
                    :active="scopeKey === 'SINGLE_CHANNEL'"
                    :icon="MonitorIcon"
                    @click="scopeKey = 'SINGLE_CHANNEL'"
                  >1 Kênh</ConfigOptionButton>
                  <ConfigOptionButton
                    :active="scopeKey === 'MULTI_CHANNEL'"
                    :icon="GlobeIcon"
                    @click="scopeKey = 'MULTI_CHANNEL'"
                  >Đa Kênh</ConfigOptionButton>
                </div>
              </div>

              <div class="field" v-if="expressionConfigs.length > 0">
                <label class="field-label">Hình thức</label>
                <div class="big-cards">
                  <ConfigOptionButton
                    v-for="c in expressionConfigs"
                    :key="c.id"
                    :active="selectedExpressionId === c.id"
                    :icon="getIconForExpression(c.name)"
                    @click="selectedExpressionId = c.id"
                  >{{ c.name }}</ConfigOptionButton>
                </div>
              </div>

              <div class="field" v-if="modificationConfigs.length > 0">
                <label class="field-label">Mức độ sử dụng (Bản quyền phái sinh)</label>
                <div class="big-cards">
                  <ConfigOptionButton
                    v-for="c in modificationConfigs"
                    :key="c.id"
                    :active="selectedModificationId === c.id"
                    :icon="getIconForModification(c.name)"
                    @click="selectedModificationId = c.id"
                  >{{ c.name }}</ConfigOptionButton>
                </div>
              </div>
            </div>

            <div class="price-summary" :style="{ opacity: isCalculating ? 0.6 : 1 }">
              <div class="ps-total">
                <span>Tạm tính</span>
                <transition name="price">
                  <strong v-if="calcData" :key="calcData.total" class="gradient-text">{{ formatVND(calcData.total) }}</strong>
                </transition>
              </div>
              <small class="muted">Chưa gồm phí xử lý 4% & VAT. Hợp đồng số phát hành ngay sau thanh toán.</small>
            </div>

            <div class="actions">
              <button class="btn btn-primary btn-lg" @click="buyNow">Tiến hành mua tác quyền</button>
              <button class="btn btn-ghost btn-lg" @click="addToCart">
                <span v-if="!addedFlash">Thêm vào giỏ</span>
                <span v-else>✓ Đã thêm</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>

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
            <li><span>Tác giả</span><b>{{ product.authorName || 'Nghệ sĩ' }}</b></li>
            <li><span>Ngày đăng ký</span><b>{{ formatDate(product.createdAt) }}</b></li>
            <li><span>Trạng thái</span><b class="ok">✓ Đã xác minh trên MusicA</b></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Related -->
    <section v-if="related.length > 0" class="section related">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <h2>Tác phẩm bạn có thể thích</h2>
          </div>
        </div>
        <div class="grid">
          <div v-for="(p, i) in related" :key="p.id" class="reveal" :style="{ transitionDelay: (i * 50) + 'ms' }">
            <MarketProductCard :item="p" />
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
  border: 1px solid var(--c-border);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-md);
}
.config-head h2 { margin: 8px 0 16px; font-size: 19px; letter-spacing: -0.01em; }
.field { margin-bottom: 18px; }
.field-label {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--c-text);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}
.big-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

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
  gap: 4px;
  background: var(--c-bg-soft);
  padding: 4px;
  border-radius: var(--radius-full);
  border: 1px solid var(--c-border);
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

/* Related */
.related .grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
@media (max-width: 1024px) { .related .grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 760px) { .related .grid { grid-template-columns: repeat(2, 1fr); } }

@media (max-width: 980px) {
  .right { position: static; }
  .left-sticky { position: static; }
}
@media (max-width: 560px) {
  .player-row { grid-template-columns: 100px 1fr; gap: 14px; padding: 14px; }
  .art { width: 100px; height: 100px; }
  .meta-row > div { padding: 8px 12px; }
  .actions { flex-direction: column; }
}
</style>
