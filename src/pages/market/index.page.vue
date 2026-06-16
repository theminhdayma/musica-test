<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { listProducts } from '../../modules/catalog/api'
import type { ProductListItem } from '../../modules/catalog/types'
import { useAsyncResource } from '../../shared/lib/useAsyncResource'
import { ApiError } from '../../shared/api/errors'
import ErrorState from '../../shared/ui/states/ErrorState.vue'
import SkeletonCard from '../../shared/ui/skeleton/SkeletonCard.vue'
import ProductGrid from './components/ProductGrid.vue'

useHead({
  title: 'Marketplace tác quyền — MusicA',
  meta: [
    {
      name: 'description',
      content: 'Khám phá và cấp phép âm nhạc theo thể loại, nghệ sĩ. Hàng trăm tác phẩm chất lượng cao.'
    }
  ]
})

const route = useRoute()

type SortFilter =
  | 'createdAt:desc'
  | 'createdAt:asc'
  | 'updatedAt:desc'
  | 'updatedAt:asc'
  | 'title:asc'
  | 'title:desc'
  | 'genre:asc'
  | 'genre:desc'

const DEFAULT_PAGE_SIZE = 40
const DEFAULT_SORT: SortFilter = 'createdAt:desc'
const FACET_PAGE_SIZE = 100
const SORT_OPTIONS: SortFilter[] = [
  'createdAt:desc',
  'createdAt:asc',
  'updatedAt:desc',
  'updatedAt:asc',
  'title:asc',
  'title:desc',
  'genre:asc',
  'genre:desc'
]
const PRICE_PRESETS = [
  { id: 'under-2m', label: 'Dưới 2 triệu', maxPrice: 2_000_000 },
  { id: '2m-25m', label: '2 - 2.5 triệu', minPrice: 2_000_000, maxPrice: 2_500_000 },
  { id: '25m-3m', label: '2.5 - 3 triệu', minPrice: 2_500_000, maxPrice: 3_000_000 },
  { id: 'over-3m', label: 'Trên 3 triệu', minPrice: 3_000_000 }
] as const

const initialQuery = route.query
const searchQ = ref(typeof initialQuery.q === 'string' ? initialQuery.q : '')
const selectedGenre = ref(typeof initialQuery.genre === 'string' ? initialQuery.genre : 'all')
const selectedSort = ref<SortFilter>(
  typeof initialQuery.sort === 'string' && SORT_OPTIONS.includes(initialQuery.sort as SortFilter)
    ? initialQuery.sort as SortFilter
    : DEFAULT_SORT
)
const minPriceInput = ref(readPriceParam(initialQuery.minPrice))
const maxPriceInput = ref(readPriceParam(initialQuery.maxPrice))
const currentPage = ref(readNumberParam(initialQuery.page, 1))
const filtersExpanded = ref({
  genre: true,
  price: true
})

function readNumberParam(v: unknown, fallback: number) {
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.floor(n)
}

function readPriceParam(v: unknown) {
  if (v === undefined || v === null || v === '') return ''
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0) return ''
  return new Intl.NumberFormat('vi-VN').format(Math.floor(n))
}

function stripPriceText(value: string) {
  return value.replace(/[^\d]/g, '')
}

function parsePriceInput(value: string) {
  const normalized = stripPriceText(value.trim())
  if (!normalized) return undefined
  const n = Number(normalized)
  if (!Number.isFinite(n) || n < 0) return undefined
  return Math.floor(n)
}

function formatCompactVND(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`
}

function formatPriceInputText(value: string) {
  const n = parsePriceInput(value)
  if (n === undefined) return ''
  return new Intl.NumberFormat('vi-VN').format(n)
}

function toPriceText(value: number | undefined) {
  if (value === undefined) return ''
  return new Intl.NumberFormat('vi-VN').format(value)
}

function getCaretIndexAfterDigits(text: string, digitsBeforeCaret: number) {
  if (digitsBeforeCaret <= 0) return 0
  let digits = 0
  for (let i = 0; i < text.length; i += 1) {
    if (/\d/.test(text[i])) digits += 1
    if (digits >= digitsBeforeCaret) return i + 1
  }
  return text.length
}

function countDigitsBeforeCaret(text: string, caretIndex: number) {
  return stripPriceText(text.slice(0, Math.max(0, caretIndex))).length
}

async function onMinPriceInput(event: Event) {
  const el = event.target as HTMLInputElement | null
  if (!el) return
  const caret = el.selectionStart ?? el.value.length
  const digitsBefore = countDigitsBeforeCaret(el.value, caret)
  const formatted = formatPriceInputText(el.value)
  minPriceInput.value = formatted
  await nextTick()
  const nextCaret = getCaretIndexAfterDigits(formatted, digitsBefore)
  el.setSelectionRange(nextCaret, nextCaret)
}

async function onMaxPriceInput(event: Event) {
  const el = event.target as HTMLInputElement | null
  if (!el) return
  const caret = el.selectionStart ?? el.value.length
  const digitsBefore = countDigitsBeforeCaret(el.value, caret)
  const formatted = formatPriceInputText(el.value)
  maxPriceInput.value = formatted
  await nextTick()
  const nextCaret = getCaretIndexAfterDigits(formatted, digitsBefore)
  el.setSelectionRange(nextCaret, nextCaret)
}

const normalizedPriceRange = computed(() => {
  let minPrice = parsePriceInput(minPriceInput.value)
  let maxPrice = parsePriceInput(maxPriceInput.value)

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    ;[minPrice, maxPrice] = [maxPrice, minPrice]
  }

  return { minPrice, maxPrice }
})

const activePricePresetId = computed(() => {
  const { minPrice, maxPrice } = normalizedPriceRange.value
  const matchedPreset = PRICE_PRESETS.find(preset =>
    preset.minPrice === minPrice && preset.maxPrice === maxPrice
  )
  return matchedPreset?.id ?? null
})

const priceFilterLabel = computed(() => {
  const { minPrice, maxPrice } = normalizedPriceRange.value
  if (minPrice !== undefined && maxPrice !== undefined) {
    return `${formatCompactVND(minPrice)} - ${formatCompactVND(maxPrice)}`
  }
  if (minPrice !== undefined) {
    return `Từ ${formatCompactVND(minPrice)}`
  }
  if (maxPrice !== undefined) {
    return `Đến ${formatCompactVND(maxPrice)}`
  }
  return ''
})

const requestState = computed(() => {
  const { minPrice, maxPrice } = normalizedPriceRange.value
  return {
    q: searchQ.value.trim(),
    genre: selectedGenre.value,
    minPrice,
    maxPrice,
    sort: selectedSort.value,
    page: currentPage.value,
    pageSize: DEFAULT_PAGE_SIZE,
  }
})

const resource = useAsyncResource(async () => {
  const { q, genre, minPrice, maxPrice, sort, page, pageSize } = requestState.value
  return await listProducts({
    q: q.trim() || undefined,
    genre: genre !== 'all' ? genre : undefined,
    minPrice,
    maxPrice,
    sort,
    page,
    pageSize
  })
})

const facetResource = useAsyncResource(async () => {
  return await listProducts({
    page: 1,
    pageSize: FACET_PAGE_SIZE,
    sort: 'title:asc'
  })
})

const items = computed<ProductListItem[]>(() => resource.data.value?.data.items || [])
const pagination = computed(() => resource.data.value?.meta?.pagination || null)
const facetItems = computed<ProductListItem[]>(() => facetResource.data.value?.data.items || [])
const errorRequestId = computed(() => (resource.error.value instanceof ApiError ? resource.error.value.requestId : null))
const errorMessage = computed(() => (resource.error.value instanceof ApiError ? resource.error.value.message : resource.error.value instanceof Error ? resource.error.value.message : 'Không thể tải dữ liệu'))
const lastRenderedItems = ref<ProductListItem[]>([])

function normalizeLabel(value: string) {
  return value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase())
}

const genreCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {}
  for (const item of facetItems.value) {
    for (const genre of item.genres.length ? item.genres : item.genre ? [item.genre] : []) {
      counts[genre] = (counts[genre] || 0) + 1
    }
  }
  return counts
})

const genreOptions = computed(() => {
  const values = new Set<string>()
  for (const item of facetItems.value) {
    for (const genre of item.genres.length ? item.genres : item.genre ? [item.genre] : []) {
      values.add(genre)
    }
  }
  if (selectedGenre.value !== 'all') values.add(selectedGenre.value)
  return [
    { id: 'all', label: 'Tất cả' },
    ...Array.from(values).sort((a, b) => a.localeCompare(b)).map(genre => ({
      id: genre,
      label: normalizeLabel(genre)
    }))
  ]
})

const resultCount = computed(() => pagination.value?.totalItems ?? displayItems.value.length)
const hasLoadedOnce = ref(false)
const displayItems = computed<ProductListItem[]>(() => {
  if (resource.status.value === 'loading' && lastRenderedItems.value.length > 0) {
    return lastRenderedItems.value
  }
  return items.value
})
const showLoadingOverlay = computed(() => resource.status.value === 'loading' && hasLoadedOnce.value)

function buildQuery(overrides?: Partial<{
  q: string
  genre: string
  minPrice: number | undefined
  maxPrice: number | undefined
  sort: SortFilter
  page: number
}>): Record<string, string> {
  const { minPrice, maxPrice } = normalizedPriceRange.value
  const state = {
    q: searchQ.value.trim(),
    genre: selectedGenre.value,
    minPrice,
    maxPrice,
    sort: selectedSort.value,
    page: currentPage.value,
    ...overrides
  }

  const query: Record<string, string> = {}
  if (state.q) query.q = state.q
  if (state.genre !== 'all') query.genre = state.genre
  if (state.minPrice !== undefined) query.minPrice = String(state.minPrice)
  if (state.maxPrice !== undefined) query.maxPrice = String(state.maxPrice)
  if (state.sort !== DEFAULT_SORT) query.sort = state.sort
  if (state.page > 1) query.page = String(state.page)
  if (query.page || Object.keys(query).length > 0) query.pageSize = String(DEFAULT_PAGE_SIZE)
  return query
}

function syncBrowserUrl(overrides?: Parameters<typeof buildQuery>[0]) {
  const query = buildQuery(overrides)
  const search = new URLSearchParams(query).toString()
  const nextUrl = search ? `${route.path}?${search}` : route.path
  window.history.replaceState(window.history.state, '', nextUrl)
}

function applyFilters(options?: { resetPage?: boolean }) {
  if (options?.resetPage) currentPage.value = 1
  syncBrowserUrl()
  reload()
}

function changeGenre(genre: string) {
  selectedGenre.value = genre
  applyFilters({ resetPage: true })
}

function setPricePreset(minPrice?: number, maxPrice?: number) {
  minPriceInput.value = toPriceText(minPrice)
  maxPriceInput.value = toPriceText(maxPrice)
  applyFilters({ resetPage: true })
}

function applyPriceInputs() {
  const { minPrice, maxPrice } = normalizedPriceRange.value
  minPriceInput.value = toPriceText(minPrice)
  maxPriceInput.value = toPriceText(maxPrice)
  applyFilters({ resetPage: true })
}

function clearPriceFilter() {
  minPriceInput.value = ''
  maxPriceInput.value = ''
  applyFilters({ resetPage: true })
}

function changeSort(sort: SortFilter) {
  selectedSort.value = sort
  applyFilters({ resetPage: true })
}

let searchTimer: number | null = null

function submitSearch() {
  if (searchTimer) {
    window.clearTimeout(searchTimer)
    searchTimer = null
  }
  applyFilters({ resetPage: true })
}

function scheduleSearch() {
  if (searchTimer) window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => {
    submitSearch()
  }, 300)
}

function clearFilters() {
  selectedGenre.value = 'all'
  selectedSort.value = DEFAULT_SORT
  minPriceInput.value = ''
  maxPriceInput.value = ''
  searchQ.value = ''
  currentPage.value = 1
  syncBrowserUrl()
  reload()
}

const hasActiveFilters = computed(() =>
  selectedGenre.value !== 'all' ||
  normalizedPriceRange.value.minPrice !== undefined ||
  normalizedPriceRange.value.maxPrice !== undefined ||
  searchQ.value.trim() !== ''
)

function toggleSection(key: keyof typeof filtersExpanded.value) {
  filtersExpanded.value[key] = !filtersExpanded.value[key]
}

function reload() {
  void resource.run().catch(() => undefined)
}

function reloadFacets() {
  void facetResource.run().catch(() => undefined)
}

function goToPage(page: number) {
  if (!pagination.value) return
  currentPage.value = Math.min(Math.max(1, page), pagination.value.totalPages)
  syncBrowserUrl()
  reload()
}

reload()

watch(items, value => {
  if (value.length > 0) {
    lastRenderedItems.value = value
  }
})

watch(() => resource.status.value, status => {
  if (status === 'success' || status === 'error') {
    hasLoadedOnce.value = true
  }
})

watch(() => facetItems.value.length, value => {
  if (value === 0 && facetResource.status.value === 'idle') {
    reloadFacets()
  }
}, { immediate: true })
</script>

<template>
  <div class="mp-page">
    <!-- ═══════════════════════════════════════════
         HERO BANNER
    ════════════════════════════════════════════ -->
    <div class="mp-hero">
      <div class="container mp-hero__inner">
        <div class="mp-hero__text">
          <div class="eyebrow">🎵 Marketplace tác quyền</div>
          <h1 class="mp-hero__title">
            Âm nhạc chất lượng<br />
            <span class="gradient-text">cho mọi sáng tạo</span>
          </h1>
          <p class="mp-hero__sub">
            Hàng trăm tác phẩm từ các nghệ sĩ uy tín. Cấp phép ngay, sử dụng hợp pháp,<br />không lo vi phạm bản quyền.
          </p>
          <div class="mp-hero__actions">
            <RouterLink to="/market" class="btn btn-primary btn-lg">
              🔥 Khám phá ngay
            </RouterLink>
            <RouterLink to="/market?sort=title%3Aasc" class="btn btn-ghost btn-lg">
              Xem theo bảng chữ cái →
            </RouterLink>
          </div>
        </div>
        <div class="mp-hero__visual">
          <div class="mp-hero__circle mp-hero__circle--1" />
          <div class="mp-hero__circle mp-hero__circle--2" />
          <div class="mp-hero__eq-bars">
            <span v-for="h in [55,80,40,90,65,100,45,75,60,85,50,95,35,70,80]" :key="h" class="mp-hero__eq-bar" :style="{ '--h': h + '%' }" />
          </div>
          <div class="mp-hero__cards-preview">
            <div class="mp-hero__mini-card" style="--clr: var(--grad-brand)">
              <div class="mp-hero__mini-cover" style="background: var(--grad-brand)" />
              <div class="mp-hero__mini-info">
                <div class="mp-hero__mini-title">Bình minh giữa thành phố</div>
                <div class="mp-hero__mini-artist">Minh Trần · V-Pop</div>
                <div class="mp-hero__mini-price">2.400.000 ₫</div>
              </div>
            </div>
            <div class="mp-hero__mini-card mp-hero__mini-card--sm">
              <div class="mp-hero__mini-cover" style="background: linear-gradient(135deg,#0e3fa0,#1f6df0 60%,#14b8a6)" />
              <div class="mp-hero__mini-info">
                <div class="mp-hero__mini-title">Nhịp đập Hà Nội</div>
                <div class="mp-hero__mini-artist">Kai Phạm · EDM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mp-main">
      <!-- ═══════════════════════════════════════════
           LAYOUT: SIDEBAR + CONTENT
      ════════════════════════════════════════════ -->
      <div class="mp-layout">

        <!-- ┌──────────────────────┐
             │  LEFT FILTER SIDEBAR │
             └──────────────────────┘ -->
        <aside class="mp-sidebar">
          <!-- Sidebar Header -->
          <div class="mp-sidebar__head">
            <div class="mp-sidebar__head-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Bộ lọc
            </div>
            <button v-if="hasActiveFilters" class="mp-sidebar__clear" @click="clearFilters">
              Xóa tất cả
            </button>
          </div>

          <!-- ── Thể loại ── -->
          <div class="mp-fblock">
            <button class="mp-fblock__title" @click="toggleSection('genre')">
              Thể loại âm nhạc
              <svg class="mp-fblock__chevron" :class="{ 'is-open': filtersExpanded.genre }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div v-if="filtersExpanded.genre" class="mp-fblock__body">
              <label
                v-for="g in genreOptions"
                :key="g.id"
                class="mp-fcheck"
                :class="{ 'is-active': selectedGenre === g.id }"
                @click="changeGenre(g.id)"
              >
                <span class="mp-fcheck__radio" :class="{ 'is-checked': selectedGenre === g.id }" />
                <span class="mp-fcheck__label">{{ g.label }}</span>
                <span class="mp-fcheck__count">
                  {{ g.id === 'all' ? resultCount : (genreCounts[g.id] || 0) }}
                </span>
              </label>
            </div>
          </div>

          <!-- ── Giá sản phẩm ── -->
          <div class="mp-fblock">
            <button class="mp-fblock__title" @click="toggleSection('price')">
              Giá sản phẩm
              <svg class="mp-fblock__chevron" :class="{ 'is-open': filtersExpanded.price }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div v-if="filtersExpanded.price" class="mp-fblock__body">
              <div class="mp-fprice">
                <div class="mp-fprice__presets">
                  <button
                    v-for="preset in PRICE_PRESETS"
                    :key="preset.id"
                    type="button"
                    class="mp-fprice__chip"
                    :class="{ 'is-active': activePricePresetId === preset.id }"
                    @click="setPricePreset(preset.minPrice, preset.maxPrice)"
                  >
                    {{ preset.label }}
                  </button>
                </div>
                <div class="mp-fprice__inputs">
                  <input
                    :value="minPriceInput"
                    class="mp-fprice__input"
                    type="text"
                    inputmode="numeric"
                    placeholder="Từ"
                    @input="onMinPriceInput"
                    @keydown.enter.prevent="applyPriceInputs"
                  />
                  <span class="mp-fprice__sep">-</span>
                  <input
                    :value="maxPriceInput"
                    class="mp-fprice__input"
                    type="text"
                    inputmode="numeric"
                    placeholder="Đến"
                    @input="onMaxPriceInput"
                    @keydown.enter.prevent="applyPriceInputs"
                  />
                </div>
                <div class="mp-fprice__actions">
                  <button type="button" class="btn btn-primary btn-sm" @click="applyPriceInputs">
                    Áp dụng
                  </button>
                  <button
                    v-if="priceFilterLabel"
                    type="button"
                    class="btn btn-ghost btn-sm"
                    @click="clearPriceFilter"
                  >
                    Xóa giá
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Active filter summary -->
          <div v-if="hasActiveFilters" class="mp-sidebar__active">
            <div class="mp-sidebar__active-title">Đang lọc:</div>
            <div class="mp-sidebar__active-tags">
              <span v-if="selectedGenre !== 'all'" class="mp-sidebar__active-tag">
                {{ genreOptions.find(g => g.id === selectedGenre)?.label }}
                <button @click="changeGenre('all')">×</button>
              </span>
              <span v-if="priceFilterLabel" class="mp-sidebar__active-tag">
                {{ priceFilterLabel }}
                <button @click="clearPriceFilter">×</button>
              </span>
            </div>
          </div>
        </aside>

        <!-- ┌──────────────────────┐
             │   MAIN CONTENT AREA  │
             └──────────────────────┘ -->
        <div class="mp-content">
          <!-- ── Sort & Search Bar ── -->
          <div class="mp-toolbar">
            <!-- Left: search input -->
            <form class="mp-toolbar__search" @submit.prevent="submitSearch">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input
                v-model="searchQ"
                type="search"
                placeholder="Tìm tác phẩm, nghệ sĩ..."
                @input="scheduleSearch"
              />
              <button type="submit" class="btn btn-primary btn-sm">Tìm</button>
            </form>

            <!-- Right: sort + count -->
            <div class="mp-toolbar__right">
              <span class="mp-toolbar__count">
                <strong>{{ resultCount }}</strong> tác phẩm
              </span>
              <div class="mp-toolbar__sort">
                <label class="mp-toolbar__sort-label">Sắp xếp:</label>
                <select v-model="selectedSort" class="mp-toolbar__select" @change="changeSort(selectedSort)">
                  <option value="createdAt:desc">Mới đăng gần đây</option>
                  <option value="updatedAt:desc">Cập nhật gần đây</option>
                  <option value="title:asc">Tên A → Z</option>
                  <option value="title:desc">Tên Z → A</option>
                  <option value="genre:asc">Thể loại A → Z</option>
                </select>
              </div>
            </div>
          </div>

          <!-- ── Category chips horizontal ── -->
          <div class="mp-chips">
            <button
              v-for="g in genreOptions"
              :key="g.id"
              class="chip"
              :class="{ 'is-active': selectedGenre === g.id }"
              @click="changeGenre(g.id)"
            >{{ g.label }}</button>
          </div>

          <!-- ── Product Grid ── -->
          <div class="mp-grid-area">
            <!-- Loading state -->
            <template v-if="(resource.status.value === 'idle' || resource.status.value === 'loading') && !hasLoadedOnce && !displayItems.length">
              <div class="pgrid-skeleton">
                <SkeletonCard v-for="i in 12" :key="i" />
              </div>
            </template>

            <!-- Error state -->
            <ErrorState
              v-else-if="resource.status.value === 'error' && !items.length"
              title="Không thể tải marketplace"
              :message="errorMessage"
              :request-id="errorRequestId"
              :can-retry="true"
              @retry="reload"
            />

            <!-- Empty state -->
            <div v-else-if="resource.status.value !== 'loading' && !items.length" class="mp-empty">
              <div class="mp-empty__icon">🎵</div>
              <div class="mp-empty__title">Không tìm thấy tác phẩm</div>
              <div class="mp-empty__sub">Thử thay đổi từ khoá hoặc điều chỉnh bộ lọc</div>
              <button class="btn btn-primary" @click="clearFilters">Xóa bộ lọc</button>
            </div>

            <!-- Grid -->
            <div v-else>
              <div v-if="resource.status.value === 'error'" class="mp-inline-error">
                Không thể đồng bộ dữ liệu mới. Đang hiển thị kết quả gần nhất.
              </div>
              <div class="mp-grid-stack">
                <ProductGrid :items="displayItems" />
                <div v-if="showLoadingOverlay" class="mp-grid-overlay">
                  <div class="mp-grid-overlay__spinner" />
                </div>
              </div>

              <!-- Pagination -->
              <div v-if="pagination && pagination.totalPages > 1" class="mp-pagination">
                <div class="mp-pagination__info">
                  Trang {{ pagination.page }} / {{ pagination.totalPages }} · {{ pagination.totalItems }} tác phẩm
                </div>
                <div class="mp-pagination__actions">
                  <button class="btn btn-ghost btn-sm" :disabled="!pagination.hasPrevPage" @click="goToPage(pagination.page - 1)">Trang trước</button>
                  <button class="btn btn-primary btn-sm" :disabled="!pagination.hasNextPage" @click="goToPage(pagination.page + 1)">Trang sau</button>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Explore CTA Banner ── -->
          <div class="mp-explore-cta">
            <div class="mp-explore-cta__inner">
              <div class="mp-explore-cta__text">
                <div class="mp-explore-cta__title">Mở khóa tác quyền không giới hạn</div>
                <div class="mp-explore-cta__sub">Cùng 10.000+ nhà sáng tạo đang dùng MusicA Pro</div>
              </div>
              <div class="mp-explore-cta__actions">
                <RouterLink to="/market" class="btn btn-primary btn-lg">
                  🚀 Xem gói Pro
                </RouterLink>
                <RouterLink to="/market" class="btn btn-ghost btn-lg">
                  Tìm hiểu thêm
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════
   PAGE WRAPPER
═══════════════════════════════════════ */
.mp-page {
  background: var(--c-bg-soft);
  min-height: 100vh;
}

/* ═══════════════════════════════════════
   HERO BANNER
═══════════════════════════════════════ */
.mp-hero {
  background: var(--grad-hero);
  border-bottom: 1px solid var(--c-border);
  padding: 56px 0 60px;
  overflow: hidden;
  position: relative;
}
.mp-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231f6df0' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
  pointer-events: none;
}
.mp-hero__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
  position: relative;
}
.mp-hero__text { max-width: 560px; }
.mp-hero__title {
  font-size: 40px;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 16px 0 16px;
  color: var(--c-ink);
}
.mp-hero__sub {
  font-size: 15.5px;
  color: var(--c-text-soft);
  line-height: 1.7;
  margin-bottom: 28px;
}
.mp-hero__actions { display: flex; gap: 12px; flex-wrap: wrap; }

/* Hero Visual */
.mp-hero__visual {
  position: relative;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mp-hero__circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;
  animation: float 6s var(--ease-in-out) infinite;
}
.mp-hero__circle--1 {
  width: 240px;
  height: 240px;
  background: var(--c-blue-500);
  top: 10%;
  right: 15%;
  animation-delay: 0s;
}
.mp-hero__circle--2 {
  width: 160px;
  height: 160px;
  background: var(--c-teal-500);
  bottom: 10%;
  left: 10%;
  animation-delay: 1.5s;
}

.mp-hero__eq-bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 120px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.25;
}
.mp-hero__eq-bar {
  width: 6px;
  border-radius: 3px;
  background: var(--grad-brand);
  height: var(--h, 50%);
  animation: equalizer 1.4s ease-in-out infinite alternate;
  animation-delay: calc(var(--i, 0) * 0.08s);
}
.mp-hero__eq-bar:nth-child(odd) { animation-duration: 1.8s; }
.mp-hero__eq-bar:nth-child(3n) { animation-duration: 1.2s; }

.mp-hero__cards-preview {
  position: absolute;
  bottom: 10px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 240px;
}
.mp-hero__mini-card {
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: 10px;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
  animation: rise .8s var(--ease-out) both;
}
.mp-hero__mini-card--sm { transform: scale(0.9); transform-origin: right; opacity: 0.8; }
.mp-hero__mini-cover {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-xs);
  flex-shrink: 0;
}
.mp-hero__mini-info { display: flex; flex-direction: column; justify-content: center; min-width: 0; }
.mp-hero__mini-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mp-hero__mini-artist {
  font-size: 11px;
  color: var(--c-text-mute);
  margin-top: 2px;
}
.mp-hero__mini-price {
  font-size: 12px;
  font-weight: 800;
  color: var(--c-blue-600);
  margin-top: 4px;
}

/* ═══════════════════════════════════════
   MAIN LAYOUT
═══════════════════════════════════════ */
.mp-main {
  padding-top: 28px;
  padding-bottom: 64px;
}
.mp-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

/* ═══════════════════════════════════════
   LEFT SIDEBAR
═══════════════════════════════════════ */
.mp-sidebar {
  position: sticky;
  top: 82px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
}

.mp-sidebar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--c-border);
  background: var(--c-bg-soft);
}
.mp-sidebar__head-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--c-text);
}
.mp-sidebar__clear {
  border: none;
  background: transparent;
  color: var(--c-blue-500);
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-full);
  transition: background .2s;
}
.mp-sidebar__clear:hover { background: var(--c-blue-50); }

/* ── Filter Block ── */
.mp-fblock {
  border-bottom: 1px solid var(--c-border);
}
.mp-fblock:last-of-type { border-bottom: none; }

.mp-fblock__title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text);
  cursor: pointer;
  text-align: left;
  transition: background .2s;
}
.mp-fblock__title:hover { background: var(--c-bg-soft); }

.mp-fblock__chevron {
  flex-shrink: 0;
  color: var(--c-text-mute);
  transition: transform .25s var(--ease-out);
}
.mp-fblock__chevron.is-open { transform: rotate(180deg); }

.mp-fblock__body { padding: 4px 16px 12px; }

/* ── Check Row ── */
.mp-fcheck {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 6px;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: background .2s;
  user-select: none;
}
.mp-fcheck:hover { background: var(--c-bg-mute); }
.mp-fcheck.is-active { background: var(--c-blue-50); }

.mp-fcheck__radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--c-border-strong);
  flex-shrink: 0;
  transition: border-color .2s, background .2s;
  position: relative;
}
.mp-fcheck__radio.is-checked {
  border-color: var(--c-blue-500);
  background: var(--c-blue-500);
}
.mp-fcheck__radio.is-checked::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.mp-fcheck__label {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--c-text);
}
.mp-fcheck.is-active .mp-fcheck__label { font-weight: 600; color: var(--c-blue-700); }

.mp-fcheck__count {
  font-size: 11px;
  font-weight: 600;
  color: var(--c-text-mute);
  background: var(--c-bg-mute);
  padding: 2px 7px;
  border-radius: var(--radius-full);
}
.mp-fcheck.is-active .mp-fcheck__count {
  background: var(--c-blue-100);
  color: var(--c-blue-700);
}

/* ── Price Filter ── */
.mp-fprice { display: flex; flex-direction: column; gap: 10px; }
.mp-fprice__presets { display: flex; flex-wrap: wrap; gap: 6px; }
.mp-fprice__chip {
  padding: 5px 11px;
  border-radius: var(--radius-full);
  border: 1px solid var(--c-border);
  background: transparent;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-soft);
  cursor: pointer;
  transition: all .2s;
}
.mp-fprice__chip:hover { border-color: var(--c-blue-300); color: var(--c-blue-600); }
.mp-fprice__chip.is-active {
  background: var(--grad-brand);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 3px 10px rgba(20, 184, 166, 0.3);
}

.mp-fprice__inputs { display: grid; grid-template-columns: 1fr auto 1fr; gap: 6px; align-items: center; }
.mp-fprice__actions { display: flex; gap: 8px; flex-wrap: wrap; }
.mp-fprice__input {
  padding: 7px 10px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 12px;
  color: var(--c-text);
  background: var(--c-bg-soft);
  outline: none;
  transition: border-color .2s, box-shadow .2s;
  width: 100%;
}
.mp-fprice__input:focus { border-color: var(--c-blue-500); box-shadow: 0 0 0 3px rgba(31, 109, 240, 0.1); }
.mp-fprice__sep { font-size: 13px; color: var(--c-text-mute); font-weight: 500; text-align: center; }

/* ── Active filter tags ── */
.mp-sidebar__active {
  padding: 12px 16px;
  border-top: 1px solid var(--c-border);
  background: var(--c-bg-soft);
}
.mp-sidebar__active-title { font-size: 11px; font-weight: 700; color: var(--c-text-mute); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.06em; }
.mp-sidebar__active-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.mp-sidebar__active-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--c-blue-50);
  border: 1px solid var(--c-blue-100);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  color: var(--c-blue-700);
}
.mp-sidebar__active-tag button {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: var(--c-blue-500);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color .2s;
}
.mp-sidebar__active-tag button:hover { color: var(--c-blue-700); }

/* ═══════════════════════════════════════
   MAIN CONTENT
═══════════════════════════════════════ */
.mp-content { display: flex; flex-direction: column; gap: 16px; }

/* ── Toolbar ── */
.mp-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  box-shadow: var(--shadow-xs);
}
.mp-toolbar__search {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 260px;
  background: var(--c-bg-mute);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-full);
  padding: 6px 6px 6px 14px;
  transition: border-color .2s, box-shadow .2s;
}
.mp-toolbar__search:focus-within {
  border-color: var(--c-blue-300);
  box-shadow: 0 0 0 3px rgba(31, 109, 240, 0.1);
  background: var(--c-surface);
}
.mp-toolbar__search svg { color: var(--c-text-mute); flex-shrink: 0; }
.mp-toolbar__search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--c-text);
  font-family: inherit;
}
.mp-toolbar__search input::placeholder { color: var(--c-text-mute); }
.mp-toolbar__right {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}
.mp-toolbar__count {
  font-size: 13px;
  color: var(--c-text-soft);
  white-space: nowrap;
}
.mp-toolbar__count strong { color: var(--c-text); font-weight: 800; }
.mp-toolbar__sort { display: flex; align-items: center; gap: 8px; }
.mp-toolbar__sort-label { font-size: 13px; font-weight: 600; color: var(--c-text-soft); white-space: nowrap; }
.mp-toolbar__select {
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-surface);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
  padding: 7px 10px;
  outline: none;
  cursor: pointer;
  transition: border-color .2s;
}
.mp-toolbar__select:focus { border-color: var(--c-blue-500); }

/* ── Genre Chips ── */
.mp-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ── Grid skeleton ── */
.pgrid-skeleton {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.mp-grid-stack {
  position: relative;
}

.mp-grid-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 24px;
  background: linear-gradient(to bottom, rgba(248, 250, 252, 0.78), rgba(248, 250, 252, 0.18));
  pointer-events: none;
}

.mp-grid-overlay__spinner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid rgba(31, 109, 240, 0.15);
  border-top-color: var(--c-blue-500);
  animation: spin .8s linear infinite;
}

.mp-inline-error {
  padding: 10px 12px;
  border: 1px solid #fecaca;
  background: #fff7ed;
  color: #9a3412;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
}

/* ── Empty State ── */
.mp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 72px 24px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  text-align: center;
}
.mp-empty__icon { font-size: 48px; }
.mp-empty__title { font-size: 18px; font-weight: 800; color: var(--c-text); }
.mp-empty__sub { font-size: 14px; color: var(--c-text-mute); }

/* ── Pagination ── */
.mp-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 32px;
  padding: 12px;
}
.mp-pagination__info { font-size: 13px; color: var(--c-text-soft); }
.mp-pagination__actions {
  display: flex;
  gap: 8px;
}

/* ── CTA Banner ── */
.mp-explore-cta {
  background: var(--grad-cta);
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  margin-top: 8px;
}
.mp-explore-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E") repeat;
}
.mp-explore-cta__inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 32px 36px;
  flex-wrap: wrap;
}
.mp-explore-cta__title {
  font-size: 22px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.02em;
}
.mp-explore-cta__sub { font-size: 14px; color: rgba(255,255,255,0.75); margin-top: 6px; }
.mp-explore-cta__actions { display: flex; gap: 12px; flex-shrink: 0; }

/* ── Override btn for dark bg ── */
.mp-explore-cta .btn-ghost {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
  color: #fff;
}
.mp-explore-cta .btn-ghost:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}
.mp-explore-cta .btn-primary {
  background: #fff;
  color: var(--c-blue-700);
  box-shadow: 0 4px 20px rgba(255,255,255,0.2);
}
.mp-explore-cta .btn-primary:hover {
  box-shadow: 0 8px 30px rgba(255,255,255,0.3);
  transform: translateY(-1px);
}

/* ═══════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════ */
@media (max-width: 1100px) {
  .mp-layout { grid-template-columns: 230px minmax(0, 1fr); }
  .pgrid-skeleton { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .mp-layout { grid-template-columns: 1fr; }
  .mp-sidebar { position: static; }
  .mp-hero__inner { grid-template-columns: 1fr; }
  .mp-hero__visual { display: none; }
  .pgrid-skeleton { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .mp-hero { padding: 40px 0; }
  .mp-hero__title { font-size: 28px; }
  .mp-toolbar { flex-direction: column; align-items: stretch; }
  .mp-toolbar__right { justify-content: space-between; }
  .pgrid-skeleton { grid-template-columns: 1fr; }
  .mp-explore-cta__inner { flex-direction: column; text-align: center; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
