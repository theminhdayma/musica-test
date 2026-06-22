<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import { ApiError } from '../../shared/api/errors'
import { useAsyncResource } from '../../shared/lib/useAsyncResource'
import ErrorState from '../../shared/ui/states/ErrorState.vue'
import SkeletonCard from '../../shared/ui/skeleton/SkeletonCard.vue'
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
  const { data } = await getMyProductOriginalUploadUrl(productId)
  await uploadToSignedUrl(data.uploadUrl, file)
  await confirmMyProductAudioUpload(productId, { mode: 'original', fileKey: data.fileKey })
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

const requestId = computed(() => (resource.error.value instanceof ApiError ? resource.error.value.requestId : null))
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

  const durationValue = createForm.duration.trim()
  const duration = durationValue ? Number(durationValue) : undefined
  if (durationValue && !Number.isFinite(duration)) {
    createError.value = 'Duration không hợp lệ'
    return
  }

  isCreating.value = true
  try {
    const res = await createMyProduct({
      title,
      authorName: createForm.authorName.trim() || undefined,
      duration: typeof duration === 'number' ? Math.max(0, Math.round(duration)) : undefined,
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
  <div class="container section">
    <div class="flex min-w-0 flex-col gap-4 pb-8 sm:gap-5 lg:gap-6">
      <section class="rounded-2xl border p-4 sm:p-5" style="border-color: var(--admin-border); background: var(--admin-surface-0); box-shadow: var(--admin-elev-1)">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--admin-primary-50)] text-[color:var(--admin-primary-600)]">
                <i class="pi pi-wave-pulse" />
              </div>
              <div class="min-w-0">
                <h1 class="truncate text-lg font-semibold" style="color: var(--admin-text)">Quản lý sản phẩm</h1>
                <p class="mt-1 text-sm" style="color: var(--admin-text-muted)">
                  Danh sách sản phẩm của bạn. Bạn có thể tạo mới và điều hướng sang trang chi tiết để cấu hình.
                </p>
              </div>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <button
              type="button"
              class="inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-[color:var(--admin-ring)] focus-visible:ring-offset-1"
              style="border-color: transparent; background: var(--admin-primary-button-bg); color: var(--admin-primary-button-text)"
              @click="openCreateDialog"
            >
              <i class="pi pi-plus text-xs" />
              Thêm sản phẩm
            </button>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border p-4 sm:p-5" style="border-color: var(--admin-border); background: var(--admin-surface-0); box-shadow: var(--admin-elev-1)">
        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label
              class="flex h-9 w-full items-center overflow-hidden rounded-lg border bg-[color:var(--admin-surface-0)] transition [border-color:var(--admin-border)] focus-within:[border-color:var(--admin-primary-500)] focus-within:ring-2 focus-within:ring-[color:var(--admin-ring)]"
            >
              <span class="flex h-full w-10 shrink-0 items-center justify-center border-r text-[color:var(--admin-text-muted)] [border-color:var(--admin-border)]">
                <i class="pi pi-search" />
              </span>
              <input
                v-model="filters.keyword"
                type="text"
                placeholder="Tìm theo tên, tác giả hoặc thể loại..."
                class="h-full w-full border-0 bg-transparent px-3 text-sm text-[color:var(--admin-text)] outline-none placeholder:text-[color:var(--admin-text-muted)]"
                @keydown.enter.prevent="page = 1; reload()"
              />
            </label>

            <label
              class="flex h-9 w-full items-center overflow-hidden rounded-lg border bg-[color:var(--admin-surface-0)] transition [border-color:var(--admin-border)] focus-within:[border-color:var(--admin-primary-500)] focus-within:ring-2 focus-within:ring-[color:var(--admin-ring)] sm:w-[240px]"
            >
              <span class="flex h-full w-10 shrink-0 items-center justify-center border-r text-[color:var(--admin-text-muted)] [border-color:var(--admin-border)]">
                <i class="pi pi-tag" />
              </span>
              <select
                v-model="filters.status"
                class="h-full w-full appearance-none border-0 bg-transparent px-3 text-sm text-[color:var(--admin-text)] outline-none"
                @change="page = 1; reload()"
              >
                <option value="ALL">Tất cả</option>
                <option value="PENDING">Pending</option>
                <option value="PUBLISHED">Published</option>
                <option value="HIDDEN">Hidden</option>
              </select>
              <span class="mr-3 text-xs text-[color:var(--admin-text-muted)]">
                <i class="pi pi-chevron-down" />
              </span>
            </label>
          </div>

          <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span class="text-xs" style="color: var(--admin-text-muted)">
              <span class="font-semibold" style="color: var(--admin-text)">{{ totalItems }}</span> sản phẩm
              <template v-if="totalItems > 0"> · {{ pageStart }}–{{ pageEnd }}</template>
            </span>
          </div>
        </div>

        <div class="mt-4 space-y-3">
          <Message v-if="resource.status.value === 'error'" severity="error">{{ errorMessage }}</Message>
        </div>

        <div class="mt-4 grid gap-2 sm:hidden">
          <div v-if="resource.status.value === 'loading' || resource.status.value === 'idle'" v-for="i in 4" :key="`msk-${i}`" class="rounded-xl border p-4" style="border-color: var(--admin-border); background: var(--admin-surface-0)">
            <div class="flex items-start gap-3">
              <div class="h-12 w-12 shrink-0 animate-pulse rounded-lg" style="background: var(--admin-surface-2)" />
              <div class="flex-1 space-y-2">
                <div class="h-3.5 w-40 animate-pulse rounded" style="background: var(--admin-surface-2)" />
                <div class="h-3 w-28 animate-pulse rounded" style="background: var(--admin-surface-2)" />
              </div>
            </div>
          </div>

          <article
            v-else
            v-for="track in items"
            :key="track.id"
            class="rounded-xl border p-4"
            style="border-color: var(--admin-border); background: var(--admin-surface-0)"
          >
            <div class="flex items-start gap-3">
              <div class="h-12 w-12 shrink-0 overflow-hidden rounded-lg border" style="border-color: var(--admin-border)">
                <div class="flex h-full w-full items-center justify-center text-xs font-bold" style="background: var(--admin-primary-50); color: var(--admin-primary-700)">
                  {{ track.title.slice(0, 2).toUpperCase() }}
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="truncate text-[13px] font-semibold leading-tight" style="color: var(--admin-text)">{{ track.title }}</h3>
                <p class="mt-0.5 truncate text-[11px]" style="color: var(--admin-text-muted)">
                  <span v-if="track.authorName">{{ track.authorName }}</span>
                  <span v-else class="font-mono opacity-60">#{{ (track.artistId || '—').slice(0, 8) }}</span>
                </p>
                <p class="mt-0.5 text-[10px]" style="color: var(--admin-text-muted); opacity: 0.75">
                  {{ resolveGenresDisplay(track.genres) }} · {{ formatDuration(track.duration) }}
                </p>
              </div>
            </div>

            <div class="mt-3 flex flex-wrap items-center gap-1.5">
              <span
                class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                style="border-color: var(--admin-border); background: var(--admin-surface-1); color: var(--admin-text)"
              >
                <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                {{ track.status }}
              </span>
            </div>

            <p class="mt-2 text-[10px]" style="color: var(--admin-text-muted)">
              <i class="pi pi-clock text-[9px]" /> {{ formatDateTime(track.updatedAt || track.createdAt) }}
            </p>

            <div class="mt-3 flex gap-2 border-t pt-3" style="border-color: var(--admin-border)">
              <RouterLink
                class="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-[color:var(--admin-ring)] focus-visible:ring-offset-1"
                style="border-color: transparent; background: var(--admin-primary-button-bg); color: var(--admin-primary-button-text)"
                :to="{ name: 'my-product-detail', params: { productId: track.id } }"
              >
                Chi tiết
                <i class="pi pi-arrow-right text-xs" />
              </RouterLink>
            </div>
          </article>

          <div
            v-if="resource.status.value === 'success' && items.length === 0"
            class="rounded-xl border border-dashed px-4 py-12 text-center"
            style="border-color: var(--admin-border); background: var(--admin-surface-0)"
          >
            <i class="pi pi-folder-open text-2xl opacity-40" style="color: var(--admin-text-muted)" />
            <p class="mt-2 text-sm font-medium" style="color: var(--admin-text-muted)">Không có sản phẩm phù hợp.</p>
          </div>
        </div>

        <div class="mt-4 hidden overflow-hidden rounded-lg border sm:block" style="border-color: var(--admin-border); background: var(--admin-surface-0); box-shadow: var(--admin-elev-1)">
          <div class="overflow-x-auto">
            <table class="min-w-[840px] w-full text-left text-sm">
              <thead class="border-b text-[10px] font-semibold uppercase tracking-widest" style="background: var(--admin-surface-2); color: var(--admin-text-muted); border-color: var(--admin-border)">
                <tr>
                  <th class="px-4 py-3">Sản phẩm</th>
                  <th class="px-4 py-3">Genres</th>
                  <th class="px-4 py-3">Duration</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3 text-right">Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="resource.status.value === 'loading' || resource.status.value === 'idle'" v-for="i in 8" :key="`sk-${i}`" class="border-b" style="border-color: var(--admin-border)">
                  <td class="px-4 py-3" colspan="5">
                    <SkeletonCard />
                  </td>
                </tr>

                <tr v-else-if="items.length === 0" class="border-b" style="border-color: var(--admin-border)">
                  <td class="px-4 py-10 text-center text-sm" colspan="5" style="color: var(--admin-text-muted)">
                    Không có sản phẩm phù hợp.
                  </td>
                </tr>

                <tr v-else v-for="track in items" :key="track.id" class="border-b hover:bg-[color:var(--admin-surface-1)]" style="border-color: var(--admin-border)">
                  <td class="px-4 py-3">
                    <RouterLink class="block" :to="{ name: 'my-product-detail', params: { productId: track.id } }">
                      <div class="font-semibold" style="color: var(--admin-text)">{{ track.title }}</div>
                      <div class="text-xs" style="color: var(--admin-text-muted)">
                        <span v-if="track.authorName">{{ track.authorName }}</span>
                        <span v-else class="font-mono opacity-60">#{{ (track.artistId || '—').slice(0, 8) }}</span>
                      </div>
                    </RouterLink>
                  </td>
                  <td class="px-4 py-3 text-xs" style="color: var(--admin-text-muted)">{{ resolveGenresDisplay(track.genres) }}</td>
                  <td class="px-4 py-3 text-xs" style="color: var(--admin-text-muted)">{{ formatDuration(track.duration) }}</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold" style="border-color: var(--admin-border); background: var(--admin-surface-1); color: var(--admin-text)">
                      <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                      {{ track.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right text-xs" style="color: var(--admin-text-muted)">{{ formatDateTime(track.updatedAt || track.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="meta" class="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            class="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition hover:bg-[color:var(--admin-surface-1)] focus-visible:ring-2 focus-visible:ring-[color:var(--admin-ring)] focus-visible:ring-offset-1 disabled:opacity-60"
            style="border-color: var(--admin-border); background: var(--admin-surface-0); color: var(--admin-text)"
            :disabled="!meta.hasPrevPage"
            @click="prev"
          >
            Trước
          </button>
          <div class="text-xs" style="color: var(--admin-text-muted)">Trang {{ meta.page }} / {{ meta.totalPages }}</div>
          <button
            type="button"
            class="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition hover:bg-[color:var(--admin-surface-1)] focus-visible:ring-2 focus-visible:ring-[color:var(--admin-ring)] focus-visible:ring-offset-1 disabled:opacity-60"
            style="border-color: var(--admin-border); background: var(--admin-surface-0); color: var(--admin-text)"
            :disabled="!meta.hasNextPage"
            @click="next"
          >
            Sau
          </button>
        </div>
      </section>
    </div>

    <Dialog v-model:visible="createOpen" modal class="w-[calc(100vw-0.75rem)] sm:w-[min(1040px,96vw)]">
      <template #header>
        <div class="flex w-full items-center justify-between gap-4">
          <div>
            <div class="text-lg font-semibold text-[color:var(--admin-text)]">Thêm sản phẩm</div>
          </div>
          <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-[color:var(--admin-primary-50)] text-[color:var(--admin-primary-500)]">
            <i class="pi pi-wave-pulse" />
          </div>
        </div>
      </template>

      <Message v-if="createError" severity="error" class="mb-4">{{ createError }}</Message>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <section class="space-y-4 rounded-[28px] border bg-[color:var(--admin-surface-1)] p-4 sm:p-5 [border-color:var(--admin-border)]">
          <div class="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--admin-text-muted)]">
            <i class="pi pi-align-left text-[color:var(--admin-primary-500)]" />
            Thông tin chung
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-2 md:col-span-2">
              <span class="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">Tên sản phẩm</span>
              <input
                v-model="createForm.title"
                class="h-10 w-full rounded-lg border bg-[color:var(--admin-surface-0)] px-4 text-sm text-[color:var(--admin-text)] outline-none transition placeholder:text-[color:var(--admin-text-muted)] [border-color:var(--admin-border)] focus:[border-color:var(--admin-primary-500)] focus:ring-2 focus:ring-[color:var(--admin-ring)]"
                placeholder="Nhập tên sản phẩm"
              />
            </label>
            <label class="space-y-2">
              <span class="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">Tác giả (tuỳ chọn)</span>
              <input
                v-model="createForm.authorName"
                class="h-10 w-full rounded-lg border bg-[color:var(--admin-surface-0)] px-4 text-sm text-[color:var(--admin-text)] outline-none transition placeholder:text-[color:var(--admin-text-muted)] [border-color:var(--admin-border)] focus:[border-color:var(--admin-primary-500)] focus:ring-2 focus:ring-[color:var(--admin-ring)]"
                placeholder="Nhập tên tác giả"
              />
            </label>
            <label class="space-y-2">
              <span class="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">Duration (giây)</span>
              <input
                v-model="createForm.duration"
                class="h-10 w-full rounded-lg border bg-[color:var(--admin-surface-0)] px-4 text-sm text-[color:var(--admin-text)] outline-none transition placeholder:text-[color:var(--admin-text-muted)] [border-color:var(--admin-border)] focus:[border-color:var(--admin-primary-500)] focus:ring-2 focus:ring-[color:var(--admin-ring)]"
                placeholder="Ví dụ: 120"
              />
            </label>

            <div class="space-y-2 md:col-span-2">
              <span class="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">Thể loại</span>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="option in PRODUCT_GENRE_OPTIONS"
                  :key="`create-genre-${option.value}`"
                  type="button"
                  class="rounded-full border px-3 py-1 text-xs font-semibold transition"
                  :class="createForm.genres.includes(option.value)
                    ? 'bg-[color:var(--admin-primary-50)] text-[color:var(--admin-text)] [border-color:var(--admin-primary-500)]'
                    : 'bg-[color:var(--admin-surface-0)] text-[color:var(--admin-text)] [border-color:var(--admin-border)] hover:bg-[color:var(--admin-surface-2)]'"
                  @click="createForm.genres = toggleSelection(createForm.genres, option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="space-y-2 md:col-span-2">
              <span class="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">Use-case</span>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="option in PRODUCT_USE_CASE_OPTIONS"
                  :key="`create-usecase-${option.value}`"
                  type="button"
                  class="rounded-full border px-3 py-1 text-xs font-semibold transition"
                  :class="createForm.useCases.includes(option.value)
                    ? 'bg-[color:var(--admin-primary-50)] text-[color:var(--admin-text)] [border-color:var(--admin-primary-500)]'
                    : 'bg-[color:var(--admin-surface-0)] text-[color:var(--admin-text)] [border-color:var(--admin-border)] hover:bg-[color:var(--admin-surface-2)]'"
                  @click="createForm.useCases = toggleSelection(createForm.useCases, option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <label class="space-y-2 md:col-span-2">
              <span class="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">Mô tả sản phẩm</span>
              <textarea
                v-model="createForm.description"
                class="min-h-[120px] w-full rounded-lg border bg-[color:var(--admin-surface-0)] px-4 py-3 text-sm text-[color:var(--admin-text)] outline-none transition placeholder:text-[color:var(--admin-text-muted)] [border-color:var(--admin-border)] focus:[border-color:var(--admin-primary-500)] focus:ring-2 focus:ring-[color:var(--admin-ring)]"
                placeholder="Nhập mô tả chi tiết cho sản phẩm"
              />
            </label>
          </div>
        </section>

        <section class="space-y-4 rounded-[28px] border bg-[color:var(--admin-surface-1)] p-4 sm:p-5 [border-color:var(--admin-border)]">
          <div class="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--admin-text-muted)]">
            <i class="pi pi-image text-[color:var(--admin-primary-500)]" />
            Thumbnail
          </div>

          <article class="rounded-[24px] border bg-[color:var(--admin-surface-0)] p-4 [border-color:var(--admin-border)]">
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold text-[color:var(--admin-text)]">Ảnh đại diện</div>
              <span
                v-if="createThumbnailFile"
                class="rounded-full bg-[color:var(--admin-primary-50)] px-3 py-1 text-xs font-medium text-[color:var(--admin-text)]"
              >
                {{ createThumbnailFile.name }}
              </span>
            </div>
            <div class="mt-4">
              <input
                type="file"
                accept="image/*,.png,.jpg,.jpeg,.webp"
                class="block w-full text-sm text-[color:var(--admin-text-muted)] file:mr-4 file:rounded-lg file:border-0 file:bg-[color:var(--admin-primary-50)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[color:var(--admin-primary-700)] hover:file:bg-[color:var(--admin-primary-100)]"
                @change="handleCreateThumbnailFileChange"
              />
            </div>
            <div class="mt-4 overflow-hidden rounded-lg border border-dashed bg-[color:var(--admin-surface-1)] p-4 [border-color:var(--admin-border)]">
              <img v-if="createThumbnailUrl" :src="createThumbnailUrl" alt="" class="h-40 w-full rounded-lg object-cover" />
              <div v-else class="flex h-40 items-center justify-center text-sm text-[color:var(--admin-text-muted)]">Chưa chọn thumbnail</div>
            </div>
          </article>

          <div class="flex items-center gap-3 pt-2 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--admin-text-muted)]">
            <i class="pi pi-volume-up text-[color:var(--admin-primary-500)]" />
            Audio gốc
          </div>

          <article class="rounded-[24px] border bg-[color:var(--admin-surface-0)] p-4 [border-color:var(--admin-border)]">
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold text-[color:var(--admin-text)]">File MP3 gốc</div>
              <span
                v-if="createOriginalFile"
                class="rounded-full bg-[color:var(--admin-primary-50)] px-3 py-1 text-xs font-medium text-[color:var(--admin-text)]"
              >
                {{ createOriginalFile.name }}
              </span>
            </div>
            <div class="mt-4">
              <input
                type="file"
                accept=".mp3,audio/*"
                class="block w-full text-sm text-[color:var(--admin-text-muted)] file:mr-4 file:rounded-lg file:border-0 file:bg-[color:var(--admin-primary-50)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[color:var(--admin-primary-700)] hover:file:bg-[color:var(--admin-primary-100)]"
                @change="handleCreateAudioFileChange"
              />
            </div>
            <div class="mt-4">
              <audio v-if="createOriginalAudioUrl" :src="createOriginalAudioUrl" controls class="w-full" />
              <div v-else class="text-sm text-[color:var(--admin-text-muted)]">Chưa chọn audio</div>
            </div>
          </article>

          <div class="flex items-center gap-3 pt-2 text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--admin-text-muted)]">
            <i class="pi pi-file-pdf text-[color:var(--admin-primary-500)]" />
            Khuông nhạc (PDF)
          </div>

          <article class="rounded-[24px] border bg-[color:var(--admin-surface-0)] p-4 [border-color:var(--admin-border)]">
            <div class="flex items-center justify-between gap-3">
              <div class="text-sm font-semibold text-[color:var(--admin-text)]">File PDF</div>
              <span
                v-if="createSheetMusicFile"
                class="rounded-full bg-[color:var(--admin-primary-50)] px-3 py-1 text-xs font-medium text-[color:var(--admin-text)]"
              >
                {{ createSheetMusicFile.name }}
              </span>
            </div>
            <div class="mt-4">
              <input
                type="file"
                accept=".pdf,application/pdf"
                class="block w-full text-sm text-[color:var(--admin-text-muted)] file:mr-4 file:rounded-lg file:border-0 file:bg-[color:var(--admin-primary-50)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[color:var(--admin-primary-700)] hover:file:bg-[color:var(--admin-primary-100)]"
                @change="handleCreateSheetMusicFileChange"
              />
            </div>
          </article>

          <label class="block space-y-2">
            <span class="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--admin-text-muted)]">Thời lượng (giây)</span>
            <input
              v-model="createForm.duration"
              readonly
              class="h-10 w-full rounded-lg border bg-[color:var(--admin-surface-0)] px-4 text-sm text-[color:var(--admin-text)] outline-none transition [border-color:var(--admin-border)]"
            />
            <span class="text-xs text-[color:var(--admin-text-muted)]">
              {{ createForm.duration ? `≈ ${formatDuration(Number(createForm.duration))}` : 'Chọn file audio để tự đọc thời lượng.' }}
            </span>
          </label>
        </section>
      </div>

      <template #footer>
        <div class="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-[color:var(--admin-ring)] focus-visible:ring-offset-1 sm:w-auto"
            style="border-color: var(--admin-border); background: var(--admin-surface-0); color: var(--admin-text)"
            :disabled="isCreating"
            @click="createOpen = false"
          >
            Huỷ
          </button>
          <button
            type="button"
            class="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-[color:var(--admin-ring)] focus-visible:ring-offset-1 sm:w-auto"
            style="border-color: transparent; background: var(--admin-primary-button-bg); color: var(--admin-primary-button-text)"
            :disabled="isCreating"
            @click="submitCreate"
          >
            <i v-if="isCreating" class="pi pi-spin pi-spinner text-xs" />
            Tạo sản phẩm
          </button>
        </div>
      </template>
    </Dialog>
  </div>
</template>
