<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ApiError } from '../../shared/api/errors'
import { useAsyncResource } from '../../shared/lib/useAsyncResource'
import ErrorState from '../../shared/ui/states/ErrorState.vue'
import SkeletonLine from '../../shared/ui/skeleton/SkeletonLine.vue'
import { getMyProductDetail } from '../../modules/me-products/api'

const props = defineProps<{ productId: string }>()
const router = useRouter()

const resource = useAsyncResource(async () => {
  return await getMyProductDetail(props.productId)
})

const item = computed(() => resource.data.value?.data || null)
const requestId = computed(() => (resource.error.value instanceof ApiError ? resource.error.value.requestId : null))
const errorMessage = computed(() => (resource.error.value instanceof ApiError ? resource.error.value.message : resource.error.value instanceof Error ? resource.error.value.message : 'Không thể tải dữ liệu'))

function reload() {
  resource.run()
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
        title="Không thể tải chi tiết tác phẩm"
        :message="errorMessage"
        :request-id="requestId"
        :can-retry="true"
        @retry="reload"
      />

      <div v-else-if="item" class="card">
        <h1 style="margin: 0 0 6px;">{{ item.title }}</h1>
        <div class="muted">{{ item.status }} · {{ item.id.slice(0, 8) }}</div>
        <div class="muted" style="margin-top: 12px; line-height: 1.7;">{{ item.description }}</div>
      </div>
    </div>
  </div>
</template>
