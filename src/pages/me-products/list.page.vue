<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Dialog from 'primevue/dialog'
import { ApiError } from '../../shared/api/errors'
import { useAsyncResource } from '../../shared/lib/useAsyncResource'
import SkeletonCard from '../../shared/ui/skeleton/SkeletonCard.vue'
import MeAccountLayout from '../../components/features/me/MeAccountLayout.vue'
import HintIcon from '../../shared/ui/HintIcon.vue'
import {
  confirmMyProductAudioUpload,
  confirmMyProductSheetMusicUpload,
  confirmMyProductThumbnailUpload,
  createMyProduct,
  getMyProductOriginalUploadUrl,
  getMyProductSheetMusicUploadUrl,
  getMyProductThumbnailUploadUrl,
  listMyProducts
} from '../../modules/me-products/api'

const router = useRouter()
const page = ref(1)
const pageSize = 10

const filters = reactive({
  keyword: '',
  status: 'ALL' as 'ALL' | 'PENDING' | 'PUBLISHED' | 'HIDDEN'
})

const createOpen = ref(false)
const createError = ref<string | null>(null)
const isCreating = ref(false)
const createOriginalFile = ref<File | null>(null)
const createThumbnailFile = ref<File | null>(null)
const createSheetMusicFile = ref<File | null>(null)
const createOriginalAudioUrl = ref<string | null>(null)
const createThumbnailUrl = ref<string | null>(null)
const createForm = reactive({
  title: '',
  authorName: '',
  duration: '' as string,
  description: '',
  genres: [] as string[],
  useCases: [] as string[]
})

const PRODUCT_GENRE_OPTIONS = [
  { label: 'Pop', value: 'POP' },
  { label: 'Electronic', value: 'ELECTRONIC' },
  { label: 'Hip hop', value: 'HIP_HOP' },
  { label: 'Rock', value: 'ROCK' },
  { label: 'Jazz', value: 'JAZZ' },
  { label: 'Classical', value: 'CLASSICAL' },
  { label: 'Folk', value: 'FOLK' },
  { label: 'R&B', value: 'RNB' },
  { label: 'EDM', value: 'EDM' }
] as const

const PRODUCT_USE_CASE_OPTIONS = [
  { label: 'Advertisement', value: 'ADVERTISEMENT' },
  { label: 'Vlog', value: 'VLOG' },
  { label: 'Social content', value: 'SOCIAL' },
  { label: 'Film', value: 'FILM' },
  { label: 'Game', value: 'GAME' },
  { label: 'Podcast', value: 'PODCAST' },
  { label: 'Event', value: 'EVENT' }
] as const

const toggleSelection = <TValue extends string>(current: TValue[], value: TValue) =>
  current.includes(value) ? current.filter((item) => item !== value) : [...current, value]

const revokeObjectUrl = (url: string | null) => {
  if (url) URL.revokeObjectURL(url)
}

const resetCreateForm = () => {
  createForm.title = ''
  createForm.authorName = ''
  createForm.duration = ''
  createForm.description = ''
  createForm.genres = []
  createForm.useCases = []
  createOriginalFile.value = null
  createThumbnailFile.value = null
  createSheetMusicFile.value = null
  revokeObjectUrl(createOriginalAudioUrl.value)
  revokeObjectUrl(createThumbnailUrl.value)
  createOriginalAudioUrl.value = null
  createThumbnailUrl.value = null
}

const extractEventFile = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  return target?.files?.[0] ?? null
}

function ensureAudioFile(file: File, label: string) {
  const normalizedName = file.name.toLowerCase()
  if (!file.type.startsWith('audio/') && !normalizedName.endsWith('.mp3')) {
    throw new Error(`${label} phải là file audio hợp lệ`)
  }
}

function ensurePdfFile(file: File, label: string) {
  const normalizedName = file.name.toLowerCase()
  if (file.type !== 'application/pdf' && !normalizedName.endsWith('.pdf')) {
    throw new Error(`${label} phải là file PDF`)
  }
}

function ensureThumbnailFile(file: File, label: string): 'png' | 'jpg' | 'jpeg' | 'webp' {
  const normalizedName = file.name.toLowerCase()
  const byMime =
    file.type === 'image/png'
      ? 'png'
      : file.type === 'image/jpeg'
        ? normalizedName.endsWith('.jpeg')
          ? 'jpeg'
          : 'jpg'
        : file.type === 'image/webp'
          ? 'webp'
          : null
  const byName = normalizedName.endsWith('.png')
    ? 'png'
    : normalizedName.endsWith('.jpeg')
      ? 'jpeg'
      : normalizedName.endsWith('.jpg')
        ? 'jpg'
        : normalizedName.endsWith('.webp')
          ? 'webp'
          : null
  const extension = byMime ?? byName
  if (!extension) {
    throw new Error(`${label} phải là png, jpg, jpeg hoặc webp`)
  }
  return extension
}

async function readAudioDuration(file: File) {
  const objectUrl = URL.createObjectURL(file)
  try {
    const duration = await new Promise<number>((resolve, reject) => {
      const audio = document.createElement('audio')
      audio.preload = 'metadata'
      audio.src = objectUrl
      audio.onloadedmetadata = () => resolve(audio.duration)
      audio.onerror = () => reject(new Error('Không đọc được thời lượng từ file audio'))
    })
    if (!Number.isFinite(duration)) {
      throw new Error('Không đọc được thời lượng từ file audio')
    }
    return Math.max(0, Math.round(duration))
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

async function uploadToSignedUrl(url: string, file: File) {
  if (url.startsWith('mock://')) return
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'true'
    },
    body: file
  })
  if (response.ok) return
  const responseText = (await response.text().catch(() => '')).slice(0, 200)
  const detail = responseText.length > 0 ? `: ${responseText}` : ''
  throw new Error(`Tải file lên thất bại (${response.status} ${response.statusText})${detail}`)
}

async function uploadTrackAudioFile(productId: string, file: File) {
  ensureAudioFile(file, 'Audio gốc')
  const duration = await readAudioDuration(file)
  const { data } = await getMyProductOriginalUploadUrl(productId)
  await uploadToSignedUrl(data.uploadUrl, file)
  await confirmMyProductAudioUpload(productId, {
    mode: 'original',
    fileKey: data.fileKey,
    duration
  })
}

async function uploadTrackThumbnailFile(productId: string, file: File) {
  const extension = ensureThumbnailFile(file, 'Thumbnail')
  const { data } = await getMyProductThumbnailUploadUrl(productId, { extension })
  await uploadToSignedUrl(data.uploadUrl, file)
  await confirmMyProductThumbnailUpload(productId, { fileKey: data.fileKey })
}

async function uploadTrackSheetMusicFile(productId: string, file: File) {
  ensurePdfFile(file, 'Khuông nhạc')
  const { data } = await getMyProductSheetMusicUploadUrl(productId)
  await uploadToSignedUrl(data.uploadUrl, file)
  await confirmMyProductSheetMusicUpload(productId, { fileKey: data.fileKey })
}

const resource = useAsyncResource(async () => {
  const q = filters.keyword.trim() || undefined
  const status = filters.status === 'ALL' ? undefined : filters.status
  return await listMyProducts({ page: page.value, pageSize, q, status })
})

const items = computed(() => resource.data.value?.data.items || [])
const meta = computed(() => resource.data.value?.meta?.pagination || null)
const totalItems = computed(() => meta.value?.totalItems ?? 0)
const pageStart = computed(() => {
  if (!meta.value || meta.value.totalItems === 0) return 0
  return (meta.value.page - 1) * meta.value.pageSize + 1
})
const pageEnd = computed(() => {
  if (!meta.value || meta.value.totalItems === 0) return 0
  return Math.min(meta.value.page * meta.value.pageSize, meta.value.totalItems)
})

const errorMessage = computed(() => (resource.error.value instanceof ApiError ? resource.error.value.message : resource.error.value instanceof Error ? resource.error.value.message : 'Không thể tải dữ liệu'))

function reload() {
  resource.run()
}

function openCreateDialog() {
  createError.value = null
  resetCreateForm()
  createOpen.value = true
}

async function submitCreate() {
  createError.value = null
  const title = createForm.title.trim()
  if (!title) {
    createError.value = 'Vui lòng nhập tên sản phẩm'
    return
  }
  if (!createThumbnailFile.value) {
    createError.value = 'Cần chọn thumbnail cho sản phẩm'
    return
  }
  if (!createOriginalFile.value) {
    createError.value = 'Cần chọn file MP3 gốc khi tạo sản phẩm'
    return
  }

  isCreating.value = true
  try {
    const res = await createMyProduct({
      title,
      authorName: createForm.authorName.trim() || undefined,
      description: createForm.description.trim() || undefined,
      genres: createForm.genres.length ? [...createForm.genres] : undefined,
      useCases: createForm.useCases.length ? [...createForm.useCases] : undefined
    })
    const jobs: Array<() => Promise<unknown>> = [
      () => uploadTrackThumbnailFile(res.data.id, createThumbnailFile.value as File),
      () => uploadTrackAudioFile(res.data.id, createOriginalFile.value as File)
    ]
    if (createSheetMusicFile.value) {
      const sheetMusicFile = createSheetMusicFile.value
      jobs.push(() => uploadTrackSheetMusicFile(res.data.id, sheetMusicFile))
    }
    const results = await Promise.allSettled(jobs.map((job) => job()))
    const rejected = results.find((result): result is PromiseRejectedResult => result.status === 'rejected')
    if (rejected) {
      throw new Error(`Sản phẩm đã được tạo nhưng upload file thất bại. ${rejected.reason instanceof Error ? rejected.reason.message : String(rejected.reason)}`)
    }
    createOpen.value = false
    resetCreateForm()
    await resource.run()
    await router.push({ name: 'my-product-detail', params: { productId: res.data.id } })
  } catch (e) {
    createError.value = e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Không thể tạo sản phẩm'
  } finally {
    isCreating.value = false
  }
}

function formatDateTime(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('vi-VN')
}

function formatDuration(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  const min = Math.floor(value / 60)
  const sec = Math.floor(value % 60)
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function resolveGenresDisplay(genres?: string[]) {
  if (!genres || genres.length === 0) return '—'
  return genres.join(', ')
}

function setCreateThumbnailPreviewUrl(file: File | null) {
  revokeObjectUrl(createThumbnailUrl.value)
  createThumbnailUrl.value = file ? URL.createObjectURL(file) : null
}

function setCreateOriginalPreviewUrl(file: File | null) {
  revokeObjectUrl(createOriginalAudioUrl.value)
  createOriginalAudioUrl.value = file ? URL.createObjectURL(file) : null
}

function handleCreateThumbnailFileChange(event: Event) {
  createError.value = null
  const file = extractEventFile(event)
  createThumbnailFile.value = file
  setCreateThumbnailPreviewUrl(file)
  if (!file) return
  try {
    ensureThumbnailFile(file, 'Thumbnail')
  } catch (error) {
    createThumbnailFile.value = null
    setCreateThumbnailPreviewUrl(null)
    createError.value = error instanceof Error ? error.message : 'Thumbnail không hợp lệ'
  }
}

async function handleCreateAudioFileChange(event: Event) {
  createError.value = null
  const file = extractEventFile(event)
  createOriginalFile.value = file
  setCreateOriginalPreviewUrl(file)
  if (!file) {
    createForm.duration = ''
    return
  }
  try {
    ensureAudioFile(file, 'Audio gốc')
    const duration = await readAudioDuration(file)
    createForm.duration = String(duration)
  } catch (error) {
    createOriginalFile.value = null
    setCreateOriginalPreviewUrl(null)
    createForm.duration = ''
    createError.value = error instanceof Error ? error.message : 'Audio không hợp lệ'
  }
}

function handleCreateSheetMusicFileChange(event: Event) {
  createError.value = null
  const file = extractEventFile(event)
  createSheetMusicFile.value = file
  if (!file) return
  try {
    ensurePdfFile(file, 'Khuông nhạc')
  } catch (error) {
    createSheetMusicFile.value = null
    createError.value = error instanceof Error ? error.message : 'PDF không hợp lệ'
  }
}

function prev() {
  if (!meta.value?.hasPrevPage) return
  page.value -= 1
  reload()
}

function next() {
  if (!meta.value?.hasNextPage) return
  page.value += 1
  reload()
}

onMounted(() => {
  reload()
})
</script>

<template>
  <MeAccountLayout active="products">
    <div class="pm-root">

      <!-- Page header -->
      <div class="pm-header">
        <div class="pm-header-left">
          <div class="pm-header-icon">
            <i class="pi pi-wave-pulse"></i>
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <h1 class="pm-title">Quản lý sản phẩm</h1>
              <HintIcon
                placement="bottom"
                content="Đây là nơi bạn quản lý toàn bộ tác phẩm âm nhạc. Mỗi sản phẩm cần được upload file audio gốc (MP3) và ảnh đại diện trước khi có thể cấu hình giá và chờ duyệt để xuất bản lên chợ."
              />
            </div>
            <p class="pm-sub">Danh sách tác phẩm âm nhạc của bạn · Tạo mới và cấu hình chi tiết</p>
          </div>
        </div>
        <button type="button" class="pm-btn-add" @click="openCreateDialog">
          <i class="pi pi-plus"></i>
          Thêm sản phẩm
        </button>
      </div>

      <!-- Filters + list card -->
      <div class="pm-card">

        <!-- Filter bar -->
        <div class="pm-filters">
          <label class="pm-search-wrap">
            <i class="pi pi-search pm-search-icon"></i>
            <input
              v-model="filters.keyword"
              type="text"
              placeholder="Tìm theo tên, tác giả hoặc thể loại..."
              class="pm-search-input"
              @keydown.enter.prevent="page = 1; reload()"
            />
          </label>

          <label class="pm-select-wrap">
            <i class="pi pi-tag pm-select-icon"></i>
            <select
              v-model="filters.status"
              class="pm-select"
              @change="page = 1; reload()"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="PUBLISHED">Đã xuất bản</option>
              <option value="HIDDEN">Đã ẩn</option>
            </select>
            <i class="pi pi-chevron-down pm-select-caret"></i>
          </label>
        </div>

        <!-- Count line -->
        <div class="pm-count-row">
          <span class="pm-count">
            <strong>{{ totalItems }}</strong> sản phẩm
            <template v-if="totalItems > 0"> · hiển thị {{ pageStart }}–{{ pageEnd }}</template>
          </span>
        </div>

        <!-- Error -->
        <div v-if="resource.status.value === 'error'" class="pm-error-banner">
          <i class="pi pi-exclamation-triangle"></i>
          {{ errorMessage }}
        </div>

        <!-- ── Mobile cards ── -->
        <div class="pm-mobile-list">
          <!-- Skeleton -->
          <template v-if="resource.status.value === 'loading' || resource.status.value === 'idle'">
            <div v-for="i in 4" :key="`msk-${i}`" class="pm-track-card pm-skeleton">
              <div class="pm-skeleton-thumb"></div>
              <div class="pm-skeleton-lines">
                <div class="pm-skeleton-line pm-skeleton-line--lg"></div>
                <div class="pm-skeleton-line pm-skeleton-line--sm"></div>
              </div>
            </div>
          </template>

          <!-- Empty -->
          <div v-else-if="items.length === 0" class="pm-empty">
            <i class="pi pi-headphones pm-empty-icon"></i>
            <div class="pm-empty-title">Chưa có sản phẩm nào</div>
            <div class="pm-empty-sub">Bắt đầu bằng cách thêm tác phẩm đầu tiên của bạn</div>
          </div>

          <!-- Items -->
          <article v-else v-for="track in items" :key="track.id" class="pm-track-card">
            <div class="pm-track-thumb">
              <span class="pm-track-initials">{{ track.title.slice(0, 2).toUpperCase() }}</span>
              <div class="pm-track-thumb-glow"></div>
            </div>
            <div class="pm-track-info">
              <div class="pm-track-title">{{ track.title }}</div>
              <div class="pm-track-author">
                <i class="pi pi-user" style="font-size:10px;"></i>
                <span v-if="track.authorName">{{ track.authorName }}</span>
                <span v-else class="pm-track-id">#{{ (track.artistId || '—').slice(0, 8) }}</span>
              </div>
              <div class="pm-track-meta">
                <span class="pm-meta-chip">{{ resolveGenresDisplay(track.genres) }}</span>
                <span class="pm-meta-dot">·</span>
                <span>{{ formatDuration(track.duration) }}</span>
              </div>
            </div>
            <div class="pm-track-right">
              <span class="pm-status-badge" :class="`pm-status--${track.status.toLowerCase()}`">
                <span class="pm-status-dot"></span>
                {{ track.status === 'PENDING' ? 'Chờ duyệt' : track.status === 'PUBLISHED' ? 'Xuất bản' : 'Đã ẩn' }}
              </span>
              <RouterLink
                class="pm-btn-detail"
                :to="{ name: 'my-product-detail', params: { productId: track.id } }"
              >
                Chi tiết <i class="pi pi-arrow-right" style="font-size:10px;"></i>
              </RouterLink>
            </div>
          </article>
        </div>

        <!-- ── Desktop table ── -->
        <div class="pm-table-wrap">
          <table class="pm-table">
            <thead class="pm-table-head">
              <tr>
                <th class="pm-th">Sản phẩm</th>
                <th class="pm-th">Thể loại</th>
                <th class="pm-th">Thời lượng</th>
                <th class="pm-th" style="white-space:nowrap;">
                  Trạng thái
                  <HintIcon
                    placement="top"
                    content="• Chờ duyệt (PENDING): Sản phẩm đang đợi admin kiểm tra. Bạn cần cấu hình giá trước.&#10;• Xuất bản (PUBLISHED): Sản phẩm đang hiển thị trên chợ để người mua tìm kiếm.&#10;• Đã ẩn (HIDDEN): Sản phẩm bị ẩn, không hiển thị công khai."
                  />
                </th>
                <th class="pm-th pm-th--right">Cập nhật</th>
                <th class="pm-th pm-th--center">Xem</th>
              </tr>
            </thead>
            <tbody>
              <!-- Skeleton rows -->
              <template v-if="resource.status.value === 'loading' || resource.status.value === 'idle'">
                <tr v-for="i in 6" :key="`sk-${i}`" class="pm-tr">
                  <td class="pm-td" colspan="6">
                    <SkeletonCard />
                  </td>
                </tr>
              </template>

              <!-- Empty row -->
              <tr v-else-if="items.length === 0" class="pm-tr">
                <td class="pm-td pm-td--empty" colspan="6">
                  <i class="pi pi-headphones" style="font-size:24px; opacity:.3;"></i>
                  <div>Chưa có sản phẩm phù hợp</div>
                </td>
              </tr>

              <!-- Data rows -->
              <template v-else>
              <tr v-for="track in items" :key="track.id" class="pm-tr pm-tr--hover">
                <td class="pm-td">
                  <RouterLink class="pm-product-link" :to="{ name: 'my-product-detail', params: { productId: track.id } }">
                    <div class="pm-product-thumb">
                      <span>{{ track.title.slice(0, 2).toUpperCase() }}</span>
                    </div>
                    <div>
                      <div class="pm-product-name">{{ track.title }}</div>
                      <div class="pm-product-author">
                        <span v-if="track.authorName">{{ track.authorName }}</span>
                        <span v-else class="pm-track-id">#{{ (track.artistId || '—').slice(0, 8) }}</span>
                      </div>
                    </div>
                  </RouterLink>
                </td>
                <td class="pm-td pm-td--muted">{{ resolveGenresDisplay(track.genres) }}</td>
                <td class="pm-td pm-td--muted">{{ formatDuration(track.duration) }}</td>
                <td class="pm-td">
                  <span class="pm-status-badge" :class="`pm-status--${track.status.toLowerCase()}`">
                    <span class="pm-status-dot"></span>
                    {{ track.status === 'PENDING' ? 'Chờ duyệt' : track.status === 'PUBLISHED' ? 'Xuất bản' : 'Đã ẩn' }}
                  </span>
                </td>
                <td class="pm-td pm-td--muted pm-td--right">{{ formatDateTime(track.updatedAt || track.createdAt) }}</td>
                <td class="pm-td pm-td--center">
                  <RouterLink
                    class="pm-eye-btn"
                    :to="{ name: 'my-product-detail', params: { productId: track.id } }"
                    title="Xem chi tiết"
                  >
                    <i class="pi pi-arrow-right"></i>
                  </RouterLink>
                </td>
              </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="meta" class="pm-pagination">
          <button type="button" class="pm-page-btn" :disabled="!meta.hasPrevPage" @click="prev">
            <i class="pi pi-chevron-left"></i> Trước
          </button>
          <span class="pm-page-info">Trang {{ meta.page }} / {{ meta.totalPages }}</span>
          <button type="button" class="pm-page-btn" :disabled="!meta.hasNextPage" @click="next">
            Sau <i class="pi pi-chevron-right"></i>
          </button>
        </div>

      </div><!-- /.pm-card -->

    </div><!-- /.pm-root -->

    <!-- ═══════════════ CREATE DIALOG ═══════════════ -->
    <Dialog v-model:visible="createOpen" modal class="w-[calc(100vw-0.75rem)] sm:w-[min(1040px,96vw)]">
      <template #header>
        <div class="dlg-header">
          <div class="dlg-header-icon"><i class="pi pi-headphones"></i></div>
          <div>
            <div class="dlg-header-title">Thêm sản phẩm mới</div>
            <div class="dlg-header-sub">Điền thông tin và upload file để hoàn tất</div>
          </div>
        </div>
      </template>

      <!-- Error -->
      <div v-if="createError" class="dlg-error">
        <i class="pi pi-exclamation-circle"></i> {{ createError }}
      </div>

      <div class="dlg-body">
        <!-- Left: Info -->
        <section class="dlg-section">
          <div class="dlg-section-title">
            <i class="pi pi-align-left"></i> Thông tin chung
            <HintIcon
              placement="right"
              content="Điền đầy đủ thông tin để tác phẩm dễ được tìm kiếm trên chợ. Tên sản phẩm và file audio là bắt buộc — các trường còn lại giúp tăng khả năng hiển thị."
            />
          </div>
          <div class="dlg-fields">
            <label class="dlg-field dlg-field--full">
              <span class="dlg-label" style="display:inline-flex;align-items:center;gap:6px;">
                Tên sản phẩm <span class="dlg-required">*</span>
                <HintIcon
                  placement="top"
                  content="Tên sẽ hiển thị công khai trên chợ. Nên đặt ngắn gọn, dễ nhớ và đúng nội dung (ví dụ: thể loại/mood). Tên tốt giúp người mua tìm thấy nhanh hơn."
                />
              </span>
              <input v-model="createForm.title" class="dlg-input" placeholder="Nhập tên bản nhạc" />
            </label>
            <label class="dlg-field dlg-field--full">
              <span class="dlg-label" style="display:inline-flex;align-items:center;gap:6px;">
                Tác giả <span class="dlg-optional">(tuỳ chọn)</span>
                <HintIcon
                  placement="top"
                  content="Nếu khác với tên nghệ sĩ hiển thị, bạn có thể điền thêm tác giả/nhạc sĩ. Thông tin rõ ràng giúp tăng độ tin cậy và giảm rủi ro khi kiểm duyệt."
                />
              </span>
              <input v-model="createForm.authorName" class="dlg-input" placeholder="Tên tác giả" />
            </label>
            <div class="dlg-field dlg-field--full">
              <span class="dlg-label" style="display:inline-flex;align-items:center;gap:6px;">
                Thể loại
                <HintIcon
                  placement="top"
                  content="Chọn 1–3 thể loại phù hợp nhất. Thể loại giúp người mua lọc tìm kiếm đúng loại nhạc họ cần — chọn đúng giúp tác phẩm xuất hiện nhiều hơn."
                />
              </span>
              <div class="dlg-chips">
                <button
                  v-for="opt in PRODUCT_GENRE_OPTIONS"
                  :key="`g-${opt.value}`"
                  type="button"
                  class="dlg-chip"
                  :class="{ active: createForm.genres.includes(opt.value) }"
                  @click="createForm.genres = toggleSelection(createForm.genres, opt.value)"
                >{{ opt.label }}</button>
              </div>
            </div>

            <div class="dlg-field dlg-field--full">
              <span class="dlg-label" style="display:inline-flex;align-items:center;gap:6px;">
                Mục đích sử dụng
                <HintIcon
                  placement="top"
                  content="Cho biết nhạc của bạn phù hợp với loại dự án nào (quảng cáo, phim, podcast…). Người mua thường lọc theo mục đích — tag đúng giúp tác phẩm tiếp cận đúng khách hàng."
                />
              </span>
              <div class="dlg-chips">
                <button
                  v-for="opt in PRODUCT_USE_CASE_OPTIONS"
                  :key="`u-${opt.value}`"
                  type="button"
                  class="dlg-chip"
                  :class="{ active: createForm.useCases.includes(opt.value) }"
                  @click="createForm.useCases = toggleSelection(createForm.useCases, opt.value)"
                >{{ opt.label }}</button>
              </div>
            </div>

            <label class="dlg-field dlg-field--full">
              <span class="dlg-label" style="display:inline-flex;align-items:center;gap:6px;">
                Mô tả
                <HintIcon
                  placement="top"
                  content="Mô tả hiển thị công khai trên chợ. Gợi ý: mood, nhịp độ (BPM), nhạc cụ nổi bật, phù hợp video/podcast/quảng cáo nào."
                />
              </span>
              <textarea
                v-model="createForm.description"
                class="dlg-textarea"
                placeholder="Mô tả chi tiết về sản phẩm của bạn..."
              ></textarea>
            </label>
          </div>
        </section>

        <!-- Right: Files -->
        <section class="dlg-section">
          <!-- Thumbnail -->
          <div class="dlg-section-title">
            <i class="pi pi-image"></i> Ảnh đại diện <span class="dlg-required">*</span>
            <HintIcon
              placement="right"
              content="Ảnh thumbnail xuất hiện trên card sản phẩm ở trang chợ. Dùng ảnh rõ nét, tỷ lệ vuông (1:1), tối thiểu 500×500px. Hỗ trợ PNG, JPG, WEBP."
            />
          </div>
          <div class="dlg-upload-box">
            <div class="dlg-thumb-preview">
              <img v-if="createThumbnailUrl" :src="createThumbnailUrl" alt="" class="dlg-thumb-img" />
              <div v-else class="dlg-thumb-placeholder">
                <i class="pi pi-image"></i>
                <span>PNG, JPG, WEBP</span>
              </div>
            </div>
            <label class="dlg-file-label">
              <i class="pi pi-upload"></i>
              {{ createThumbnailFile ? createThumbnailFile.name : 'Chọn ảnh thumbnail' }}
              <input type="file" accept="image/*,.png,.jpg,.jpeg,.webp" class="dlg-file-hidden" @change="handleCreateThumbnailFileChange" />
            </label>
          </div>

          <!-- Audio -->
          <div class="dlg-section-title" style="margin-top: 16px;">
            <i class="pi pi-volume-up"></i> File audio gốc (MP3) <span class="dlg-required">*</span>
            <HintIcon
              placement="right"
              content="Đây là file âm nhạc chất lượng cao mà người mua sẽ nhận được sau khi cấp phép. Chỉ hỗ trợ định dạng MP3. Thời lượng sẽ được đọc tự động từ file này."
            />
          </div>
          <div class="dlg-upload-box">
            <audio v-if="createOriginalAudioUrl" :src="createOriginalAudioUrl" controls class="dlg-audio-player"></audio>
            <div v-else class="dlg-audio-placeholder">
              <i class="pi pi-headphones"></i>
              <span>Chưa chọn file audio</span>
            </div>
            <label class="dlg-file-label">
              <i class="pi pi-upload"></i>
              {{ createOriginalFile ? createOriginalFile.name : 'Chọn file MP3' }}
              <input type="file" accept=".mp3,audio/*" class="dlg-file-hidden" @change="handleCreateAudioFileChange" />
            </label>
          </div>

          <!-- Sheet music -->
          <div class="dlg-section-title" style="margin-top: 16px;">
            <i class="pi pi-file-pdf"></i> Khuông nhạc PDF <span class="dlg-optional">(tuỳ chọn)</span>
            <HintIcon
              placement="right"
              content="Tải lên bản nhạc (sheet music) ở định dạng PDF nếu có. Đây là tài liệu bonus giúp tác phẩm hấp dẫn hơn với các nhạc sĩ và nhà sản xuất muốn chơi lại hoặc chỉnh sửa."
            />
          </div>
          <div class="dlg-upload-box">
            <label class="dlg-file-label">
              <i class="pi pi-upload"></i>
              {{ createSheetMusicFile ? createSheetMusicFile.name : 'Chọn file PDF' }}
              <input type="file" accept=".pdf,application/pdf" class="dlg-file-hidden" @change="handleCreateSheetMusicFileChange" />
            </label>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dlg-footer">
          <button type="button" class="dlg-btn-cancel" :disabled="isCreating" @click="createOpen = false">
            Huỷ
          </button>
          <button type="button" class="dlg-btn-submit" :disabled="isCreating" @click="submitCreate">
            <i v-if="isCreating" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-check"></i>
            {{ isCreating ? 'Đang tạo...' : 'Tạo sản phẩm' }}
          </button>
        </div>
      </template>
    </Dialog>

  </MeAccountLayout>
</template>

<style scoped>
/* ── Root ── */
.pm-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 32px;
}

/* ── Page header ── */
.pm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 20px 22px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}
.pm-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.pm-header-icon {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-sm);
  background: var(--grad-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  box-shadow: var(--shadow-glow);
  flex-shrink: 0;
}
.pm-title {
  font-size: 17px;
  font-weight: 900;
  color: var(--c-text);
  margin: 0;
  line-height: 1.2;
}
.pm-sub {
  font-size: 12px;
  color: var(--c-text-mute);
  font-weight: 500;
  margin-top: 3px;
}
.pm-btn-add {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  background: var(--grad-brand);
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-glow);
  transition: transform .2s var(--ease-out), box-shadow .2s var(--ease-out);
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
}
.pm-btn-add:hover { transform: translateY(-2px); box-shadow: 0 18px 50px rgba(20,184,166,.35); }
.pm-btn-add .pi { font-size: 12px; }

/* ── Main card ── */
.pm-card {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
}

/* ── Filters ── */
.pm-filters {
  display: flex;
  gap: 10px;
  padding: 16px 20px 0;
  flex-wrap: wrap;
}
.pm-search-wrap {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg-soft);
  overflow: hidden;
  transition: border-color .2s, box-shadow .2s;
}
.pm-search-wrap:focus-within {
  border-color: var(--c-blue-300);
  box-shadow: 0 0 0 3px var(--c-blue-50);
  background: #fff;
}
.pm-search-icon {
  padding: 0 12px;
  color: var(--c-text-mute);
  font-size: 13px;
  flex-shrink: 0;
}
.pm-search-input {
  flex: 1;
  height: 40px;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13.5px;
  color: var(--c-text);
  font-family: inherit;
}
.pm-search-input::placeholder { color: var(--c-text-mute); }

.pm-select-wrap {
  width: 220px;
  display: flex;
  align-items: center;
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-sm);
  background: var(--c-bg-soft);
  overflow: hidden;
  transition: border-color .2s, box-shadow .2s;
  position: relative;
}
.pm-select-wrap:focus-within {
  border-color: var(--c-blue-300);
  box-shadow: 0 0 0 3px var(--c-blue-50);
}
.pm-select-icon {
  padding: 0 12px;
  color: var(--c-text-mute);
  font-size: 13px;
  flex-shrink: 0;
}
.pm-select {
  flex: 1;
  height: 40px;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13.5px;
  color: var(--c-text);
  font-family: inherit;
  appearance: none;
  cursor: pointer;
}
.pm-select-caret {
  padding-right: 12px;
  color: var(--c-text-mute);
  font-size: 10px;
  flex-shrink: 0;
  pointer-events: none;
}

.pm-count-row {
  padding: 10px 20px 0;
}
.pm-count {
  font-size: 12px;
  color: var(--c-text-mute);
}
.pm-count strong { color: var(--c-text); font-weight: 700; }

.pm-error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 20px 0;
  padding: 12px 16px;
  background: #fff1f0;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
  color: #b42318;
  font-size: 13px;
  font-weight: 600;
}

/* ── Mobile cards ── */
.pm-mobile-list {
  display: none;
  flex-direction: column;
  gap: 1px;
  margin-top: 12px;
  border-top: 1px solid var(--c-border);
}
@media (max-width: 720px) {
  .pm-mobile-list { display: flex; }
  .pm-table-wrap { display: none; }
}

.pm-track-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: #fff;
  transition: background .15s;
}
.pm-track-card:hover { background: var(--c-bg-soft); }

.pm-track-thumb {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--grad-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.pm-track-initials { font-size: 14px; font-weight: 900; color: #fff; position: relative; z-index: 1; }
.pm-track-thumb-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent 60%);
}

.pm-track-info { flex: 1; min-width: 0; }
.pm-track-title { font-size: 13.5px; font-weight: 700; color: var(--c-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pm-track-author {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--c-text-mute);
  margin-top: 2px;
}
.pm-track-meta { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--c-text-mute); margin-top: 3px; }
.pm-meta-chip {
  background: var(--c-blue-50);
  color: var(--c-blue-600);
  border: 1px solid var(--c-blue-100);
  padding: 1px 7px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
}
.pm-meta-dot { opacity: .4; }
.pm-track-id { font-family: monospace; opacity: .6; }

.pm-track-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

/* Skeleton */
.pm-skeleton { background: #fff; pointer-events: none; }
.pm-skeleton-thumb {
  width: 48px; height: 48px; border-radius: 12px;
  background: var(--c-bg-mute);
  animation: shimmer 1.4s infinite;
  flex-shrink: 0;
}
.pm-skeleton-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.pm-skeleton-line {
  height: 12px; border-radius: 6px;
  background: linear-gradient(90deg, var(--c-bg-mute) 25%, var(--c-border) 50%, var(--c-bg-mute) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
.pm-skeleton-line--lg { width: 60%; }
.pm-skeleton-line--sm { width: 35%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Empty */
.pm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 56px 24px;
  text-align: center;
}
.pm-empty-icon { font-size: 36px; color: var(--c-border-strong); }
.pm-empty-title { font-size: 14px; font-weight: 700; color: var(--c-text-soft); }
.pm-empty-sub { font-size: 12px; color: var(--c-text-mute); }

/* Status badge */
.pm-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.pm-status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.pm-status--pending  { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
.pm-status--pending .pm-status-dot  { background: #f59e0b; }
.pm-status--published { background: var(--c-teal-50); color: var(--c-teal-600); border: 1px solid rgba(20,184,166,.25); }
.pm-status--published .pm-status-dot { background: var(--c-teal-500); }
.pm-status--hidden   { background: var(--c-bg-mute); color: var(--c-text-mute); border: 1px solid var(--c-border); }
.pm-status--hidden .pm-status-dot   { background: var(--c-text-mute); }

/* Detail btn (mobile) */
.pm-btn-detail {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: var(--c-blue-50);
  color: var(--c-blue-700);
  border: 1px solid var(--c-blue-100);
  font-size: 11.5px;
  font-weight: 700;
  transition: background .15s, border-color .15s;
  white-space: nowrap;
}
.pm-btn-detail:hover { background: var(--c-blue-100); border-color: var(--c-blue-300); }

/* ── Desktop table ── */
.pm-table-wrap {
  margin-top: 14px;
  border-top: 1px solid var(--c-border);
  overflow-x: auto;
}
.pm-table { width: 100%; min-width: 720px; border-collapse: collapse; }
.pm-table-head { background: var(--c-bg-soft); }
.pm-th {
  padding: 10px 16px;
  font-size: 10.5px;
  font-weight: 800;
  color: var(--c-text-mute);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: left;
  border-bottom: 1px solid var(--c-border);
  white-space: nowrap;
}
.pm-th--right { text-align: right; }
.pm-th--center { text-align: center; }

.pm-tr { border-bottom: 1px solid var(--c-border); }
.pm-tr:last-child { border-bottom: none; }
.pm-tr--hover { transition: background .15s; }
.pm-tr--hover:hover { background: var(--c-bg-soft); }

.pm-td {
  padding: 12px 16px;
  font-size: 13px;
  vertical-align: middle;
  color: var(--c-text);
}
.pm-td--muted { color: var(--c-text-mute); font-size: 12px; }
.pm-td--right { text-align: right; }
.pm-td--center { text-align: center; }
.pm-td--empty {
  text-align: center;
  padding: 48px;
  color: var(--c-text-mute);
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.pm-product-link {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pm-product-thumb {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--grad-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  color: #fff;
  flex-shrink: 0;
}
.pm-product-name {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
.pm-product-author { font-size: 11.5px; color: var(--c-text-mute); margin-top: 1px; }

.pm-eye-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-xs);
  background: var(--c-blue-50);
  color: var(--c-blue-600);
  border: 1px solid var(--c-blue-100);
  transition: background .15s, border-color .15s, transform .15s;
  font-size: 12px;
}
.pm-eye-btn:hover { background: var(--c-blue-100); border-color: var(--c-blue-300); transform: translateY(-1px); }

/* ── Pagination ── */
.pm-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--c-border);
}
.pm-page-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--c-border);
  background: #fff;
  color: var(--c-text-soft);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color .15s, color .15s, background .15s;
  font-family: inherit;
}
.pm-page-btn:hover:not(:disabled) { border-color: var(--c-blue-300); color: var(--c-blue-600); background: var(--c-blue-50); }
.pm-page-btn:disabled { opacity: .4; cursor: not-allowed; }
.pm-page-info { font-size: 12px; color: var(--c-text-mute); }

/* ══════════════ DIALOG ══════════════ */
.dlg-header {
  display: flex;
  align-items: center;
  gap: 14px;
}
.dlg-header-icon {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-sm);
  background: var(--grad-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
  box-shadow: var(--shadow-glow);
  flex-shrink: 0;
}
.dlg-header-title { font-size: 16px; font-weight: 900; color: var(--c-text); }
.dlg-header-sub { font-size: 12px; color: var(--c-text-mute); margin-top: 2px; }

.dlg-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: #fff1f0;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
  color: #b42318;
  font-size: 13px;
  font-weight: 600;
}

.dlg-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 900px) { .dlg-body { grid-template-columns: 1fr; } }

.dlg-section {
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: 18px;
}
.dlg-section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 800;
  color: var(--c-teal-600);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 14px;
}
.dlg-section-title .pi { color: var(--c-teal-500); }

.dlg-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.dlg-field { display: flex; flex-direction: column; gap: 5px; }
.dlg-field--full { grid-column: 1 / -1; }

.dlg-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--c-text-mute);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.dlg-required { color: #ef4444; margin-left: 2px; }
.dlg-optional { font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--c-text-mute); opacity: .7; }

.dlg-input {
  height: 40px;
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-xs);
  padding: 0 12px;
  font-size: 13.5px;
  color: var(--c-text);
  background: #fff;
  outline: none;
  font-family: inherit;
  transition: border-color .2s, box-shadow .2s;
}
.dlg-input:focus { border-color: var(--c-blue-300); box-shadow: 0 0 0 3px var(--c-blue-50); }
.dlg-input::placeholder { color: var(--c-text-mute); }

.dlg-textarea {
  min-height: 100px;
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-xs);
  padding: 10px 12px;
  font-size: 13.5px;
  color: var(--c-text);
  background: #fff;
  outline: none;
  font-family: inherit;
  resize: vertical;
  transition: border-color .2s, box-shadow .2s;
}
.dlg-textarea:focus { border-color: var(--c-blue-300); box-shadow: 0 0 0 3px var(--c-blue-50); }
.dlg-textarea::placeholder { color: var(--c-text-mute); }

.dlg-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.dlg-chip {
  padding: 5px 12px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--c-border);
  background: #fff;
  color: var(--c-text-soft);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
  font-family: inherit;
}
.dlg-chip:hover { border-color: var(--c-blue-300); color: var(--c-blue-600); }
.dlg-chip.active {
  background: var(--grad-brand);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 2px 8px rgba(20,184,166,.25);
}

.dlg-upload-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dlg-thumb-preview {
  width: 100%;
  aspect-ratio: 16/7;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1.5px dashed var(--c-border);
  background: #fff;
}
.dlg-thumb-img { width: 100%; height: 100%; object-fit: cover; }
.dlg-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--c-text-mute);
  font-size: 12px;
}
.dlg-thumb-placeholder .pi { font-size: 24px; opacity: .4; }

.dlg-audio-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border: 1.5px dashed var(--c-border);
  border-radius: var(--radius-sm);
  color: var(--c-text-mute);
  font-size: 13px;
  background: #fff;
}
.dlg-audio-placeholder .pi { font-size: 18px; opacity: .4; }
.dlg-audio-player { width: 100%; border-radius: var(--radius-xs); }

.dlg-file-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--c-blue-100);
  background: var(--c-blue-50);
  color: var(--c-blue-700);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s, border-color .15s;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dlg-file-label:hover { background: var(--c-blue-100); border-color: var(--c-blue-300); }
.dlg-file-hidden { display: none; }

/* Dialog footer */
.dlg-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
}
.dlg-btn-cancel {
  padding: 9px 20px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--c-border);
  background: #fff;
  color: var(--c-text-soft);
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color .15s, color .15s;
  font-family: inherit;
}
.dlg-btn-cancel:hover:not(:disabled) { border-color: var(--c-border-strong); color: var(--c-text); }
.dlg-btn-cancel:disabled { opacity: .5; cursor: not-allowed; }
.dlg-btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 24px;
  border-radius: var(--radius-full);
  background: var(--grad-brand);
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-glow);
  transition: transform .2s var(--ease-out), box-shadow .2s;
  font-family: inherit;
}
.dlg-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(20,184,166,.35); }
.dlg-btn-submit:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }
</style>
