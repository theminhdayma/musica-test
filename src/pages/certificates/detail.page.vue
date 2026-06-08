<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getMyCertificateDetail, getMyCertificateDownloadUrl } from '../../modules/certificates/api'
import { ApiError } from '../../shared/api/errors'
import { useAsyncResource } from '../../shared/lib/useAsyncResource'
import ErrorState from '../../shared/ui/states/ErrorState.vue'
import SkeletonLine from '../../shared/ui/skeleton/SkeletonLine.vue'

const props = defineProps<{ certificateId: string }>()

const router = useRouter()
const downloading = ref(false)

const resource = useAsyncResource(async () => {
  return await getMyCertificateDetail(props.certificateId)
})

const item = computed(() => resource.data.value?.data || null)
const requestId = computed(() => (resource.error.value instanceof ApiError ? resource.error.value.requestId : null))
const errorMessage = computed(() => (resource.error.value instanceof ApiError ? resource.error.value.message : resource.error.value instanceof Error ? resource.error.value.message : 'Không thể tải dữ liệu'))

function reload() {
  resource.run()
}

async function download() {
  if (!item.value) return
  downloading.value = true
  try {
    const res = await getMyCertificateDownloadUrl(props.certificateId)
    if (!res.data.downloadUrl) return
    window.open(res.data.downloadUrl, '_blank', 'noopener,noreferrer')
  } finally {
    downloading.value = false
  }
}

onMounted(() => {
  reload()
})
</script>

<template>
  <div class="container section">
    <button class="btn btn-ghost btn-sm" type="button" @click="router.back()">← Quay lại</button>

    <div style="margin-top: 12px;">
      <template v-if="resource.status.value === 'loading' || resource.status.value === 'idle'">
        <div class="card">
          <SkeletonLine width="60%" height="18px" />
          <div style="height: 10px;"></div>
          <SkeletonLine width="40%" />
          <div style="height: 10px;"></div>
          <SkeletonLine width="28%" height="10px" />
        </div>
      </template>

      <ErrorState
        v-else-if="resource.status.value === 'error'"
        title="Không thể tải chi tiết chứng nhận"
        :message="errorMessage"
        :request-id="requestId"
        :can-retry="true"
        @retry="reload"
      />

      <div v-else-if="item" class="card">
        <h1 style="margin: 0 0 6px;">{{ item.productTitle }}</h1>
        <div class="muted">{{ item.productCode }} · {{ item.artistDisplayName }}</div>

        <div style="display: grid; gap: 8px; margin-top: 16px;">
          <div style="display: flex; justify-content: space-between; gap: 12px;">
            <div class="muted">Trạng thái</div>
            <div style="font-weight: 700;">{{ item.status }}</div>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 12px;">
            <div class="muted">Ngày tạo</div>
            <div style="font-weight: 700;">{{ new Date(item.createdAt).toLocaleString('vi-VN') }}</div>
          </div>
        </div>

        <button class="btn btn-primary btn-sm" type="button" style="margin-top: 16px;" :disabled="downloading" @click="download">
          <span v-if="downloading">Đang tạo link tải…</span>
          <span v-else>Tải chứng nhận (PDF)</span>
        </button>
      </div>
    </div>
  </div>
</template>
