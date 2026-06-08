<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { listMyCertificates } from '../../modules/certificates/api'
import { ApiError } from '../../shared/api/errors'
import { useAsyncResource } from '../../shared/lib/useAsyncResource'
import ErrorState from '../../shared/ui/states/ErrorState.vue'
import SkeletonCard from '../../shared/ui/skeleton/SkeletonCard.vue'

const q = ref('')
const page = ref(1)
const pageSize = 10

const resource = useAsyncResource(async () => {
  return await listMyCertificates({ page: page.value, pageSize, q: q.value.trim() || undefined })
})

const items = computed(() => resource.data.value?.data.items || [])
const meta = computed(() => resource.data.value?.meta?.pagination || null)

const requestId = computed(() => (resource.error.value instanceof ApiError ? resource.error.value.requestId : null))
const errorMessage = computed(() => (resource.error.value instanceof ApiError ? resource.error.value.message : resource.error.value instanceof Error ? resource.error.value.message : 'Không thể tải dữ liệu'))

function reload() {
  resource.run()
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
      <h1 style="margin: 0;">Chứng nhận tác quyền của tôi</h1>
      <form style="display: flex; gap: 10px; align-items: center;" @submit.prevent="page = 1; reload()">
        <input v-model="q" class="input" type="search" placeholder="Tìm theo mã/tên tác phẩm…" style="min-width: 260px;" />
        <button class="btn btn-soft btn-sm" type="submit">Tìm</button>
      </form>
    </div>

    <div style="margin-top: 18px; display: grid; gap: 12px;">
      <template v-if="resource.status.value === 'loading' || resource.status.value === 'idle'">
        <SkeletonCard v-for="i in 6" :key="i" />
      </template>

      <ErrorState
        v-else-if="resource.status.value === 'error'"
        title="Không thể tải chứng nhận"
        :message="errorMessage"
        :request-id="requestId"
        :can-retry="true"
        @retry="reload"
      />

      <div v-else-if="!items.length" class="card">
        <div style="font-weight: 800;">Chưa có chứng nhận</div>
        <div class="muted" style="margin-top: 6px;">Bạn sẽ thấy chứng nhận sau khi hoàn tất giao dịch.</div>
      </div>

      <RouterLink
        v-else
        v-for="it in items"
        :key="it.id"
        class="card"
        :to="{ name: 'certificate-detail', params: { certificateId: it.id } }"
        style="display: flex; gap: 12px; align-items: center; justify-content: space-between;"
      >
        <div style="min-width: 0;">
          <div style="font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ it.productTitle }}</div>
          <div class="muted" style="margin-top: 4px;">{{ it.productCode }} · {{ it.artistDisplayName }}</div>
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
