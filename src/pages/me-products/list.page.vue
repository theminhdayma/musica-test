<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiError } from '../../shared/api/errors'
import { useAsyncResource } from '../../shared/lib/useAsyncResource'
import ErrorState from '../../shared/ui/states/ErrorState.vue'
import SkeletonCard from '../../shared/ui/skeleton/SkeletonCard.vue'
import { createMyProduct, listMyProducts } from '../../modules/me-products/api'

const router = useRouter()
const q = ref('')
const page = ref(1)
const pageSize = 10
const createOpen = ref(false)
const createError = ref<string | null>(null)
const isCreating = ref(false)
const createForm = reactive({
  title: '',
  authorName: '',
  duration: '' as string,
  description: '',
  genres: [] as string[],
  useCases: [] as string[]
})

const genreOptions = ['POP', 'ELECTRONIC', 'HIP_HOP', 'ROCK', 'JAZZ', 'CLASSICAL', 'FOLK', 'RNB', 'EDM'] as const
const useCaseOptions = ['ADVERTISEMENT', 'VLOG', 'SOCIAL', 'FILM', 'GAME', 'PODCAST', 'EVENT'] as const

const resource = useAsyncResource(async () => {
  return await listMyProducts({ page: page.value, pageSize, q: q.value.trim() || undefined })
})

const items = computed(() => resource.data.value?.data.items || [])
const meta = computed(() => resource.data.value?.meta?.pagination || null)

const requestId = computed(() => (resource.error.value instanceof ApiError ? resource.error.value.requestId : null))
const errorMessage = computed(() => (resource.error.value instanceof ApiError ? resource.error.value.message : resource.error.value instanceof Error ? resource.error.value.message : 'Không thể tải dữ liệu'))

function reload() {
  resource.run()
}

async function submitCreate() {
  createError.value = null
  const title = createForm.title.trim()
  if (!title) {
    createError.value = 'Vui lòng nhập tên sản phẩm'
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
    createOpen.value = false
    createForm.title = ''
    createForm.authorName = ''
    createForm.duration = ''
    createForm.description = ''
    createForm.genres = []
    createForm.useCases = []
    await router.push({ name: 'my-product-detail', params: { productId: res.data.id } })
  } catch (e) {
    createError.value = e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Không thể tạo sản phẩm'
  } finally {
    isCreating.value = false
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
    <div style="display: flex; gap: 12px; align-items: baseline; justify-content: space-between; flex-wrap: wrap;">
      <h1 style="margin: 0;">Tác phẩm của tôi</h1>
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <button class="btn btn-primary btn-sm" type="button" @click="createOpen = !createOpen">Thêm sản phẩm</button>
        <form style="display: flex; gap: 10px; align-items: center;" @submit.prevent="page = 1; reload()">
        <input v-model="q" class="input" type="search" placeholder="Tìm theo tên tác phẩm…" style="min-width: 260px;" />
        <button class="btn btn-soft btn-sm" type="submit">Tìm</button>
      </form>
      </div>
    </div>

    <div v-if="createOpen" class="card" style="margin-top: 14px;">
      <div style="font-weight: 800;">Thêm sản phẩm</div>
      <div class="muted" style="margin-top: 6px;">Sản phẩm tạo mới sẽ ở trạng thái PENDING và chờ admin duyệt.</div>
      <div style="margin-top: 12px; display: grid; gap: 10px;">
        <input v-model="createForm.title" class="input" type="text" placeholder="Tên sản phẩm" />
        <input v-model="createForm.authorName" class="input" type="text" placeholder="Tên tác giả (tuỳ chọn)" />
        <input v-model="createForm.duration" class="input" type="text" placeholder="Duration (giây) (tuỳ chọn)" />
        <textarea v-model="createForm.description" class="input" placeholder="Mô tả (tuỳ chọn)" rows="4"></textarea>

        <div style="display: grid; gap: 6px;">
          <div class="muted">Genres</div>
          <select v-model="createForm.genres" class="input" multiple>
            <option v-for="g in genreOptions" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>

        <div style="display: grid; gap: 6px;">
          <div class="muted">Use cases</div>
          <select v-model="createForm.useCases" class="input" multiple>
            <option v-for="u in useCaseOptions" :key="u" :value="u">{{ u }}</option>
          </select>
        </div>

        <div v-if="createError" class="card" style="border-color: rgba(220, 38, 38, 0.35);">
          <div style="font-weight: 800;">Không thể tạo sản phẩm</div>
          <div class="muted" style="margin-top: 6px;">{{ createError }}</div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn btn-ghost btn-sm" type="button" :disabled="isCreating" @click="createOpen = false">Huỷ</button>
          <button class="btn btn-primary btn-sm" type="button" :disabled="isCreating" @click="submitCreate">
            {{ isCreating ? 'Đang tạo…' : 'Tạo sản phẩm' }}
          </button>
        </div>
      </div>
    </div>

    <div style="margin-top: 18px; display: grid; gap: 12px;">
      <template v-if="resource.status.value === 'loading' || resource.status.value === 'idle'">
        <SkeletonCard v-for="i in 6" :key="i" />
      </template>

      <ErrorState
        v-else-if="resource.status.value === 'error'"
        title="Không thể tải danh sách tác phẩm"
        :message="errorMessage"
        :request-id="requestId"
        :can-retry="true"
        @retry="reload"
      />

      <div v-else-if="!items.length" class="card">
        <div style="font-weight: 800;">Chưa có tác phẩm</div>
        <div class="muted" style="margin-top: 6px;">Tác phẩm sẽ xuất hiện tại đây sau khi được tạo.</div>
      </div>

      <RouterLink
        v-else
        v-for="it in items"
        :key="it.id"
        class="card"
        :to="{ name: 'my-product-detail', params: { productId: it.id } }"
        style="display: flex; gap: 12px; align-items: center; justify-content: space-between;"
      >
        <div style="min-width: 0;">
          <div style="font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ it.title }}</div>
          <div class="muted" style="margin-top: 4px;">{{ it.status }} · {{ it.id.slice(0, 8) }}</div>
        </div>
        <div class="muted" style="white-space: nowrap;">{{ new Date(it.createdAt).toLocaleDateString('vi-VN') }}</div>
      </RouterLink>
    </div>

    <div v-if="meta" style="margin-top: 16px; display: flex; gap: 10px; align-items: center; justify-content: flex-end;">
      <button class="btn btn-ghost btn-sm" type="button" :disabled="!meta.hasPrevPage" @click="prev">Trước</button>
      <div class="muted">Trang {{ meta.page }} / {{ meta.totalPages }}</div>
      <button class="btn btn-ghost btn-sm" type="button" :disabled="!meta.hasNextPage" @click="next">Sau</button>
    </div>
  </div>
</template>
