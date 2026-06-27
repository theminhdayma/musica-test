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
  <div class="container section cert-page">
    <div class="cert-hero">
      <div>
        <div class="cert-eyebrow">Certificate Center</div>
        <h1>Chứng nhận bản quyền đã mua</h1>
        <p>Trang này hiện là bản demo để buyer xem nhanh các tài sản số đã mua, thông tin license cơ bản và điều hướng sang chi tiết certificate.</p>
      </div>
      <form class="cert-search" @submit.prevent="page = 1; reload()">
        <input v-model="q" class="input" type="search" placeholder="Tìm theo mã / tên tác phẩm..." />
        <button class="btn btn-soft btn-sm" type="submit">Tìm</button>
      </form>
    </div>

    <div class="cert-grid">
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

      <div v-else-if="!items.length" class="card cert-empty">
        <div style="font-weight: 800;">Chưa có certificate</div>
        <div class="muted" style="margin-top: 6px;">Bạn sẽ thấy certificate sau khi hoàn tất giao dịch bản quyền số.</div>
      </div>

      <RouterLink
        v-else
        v-for="it in items"
        :key="it.id"
        class="card cert-card"
        :to="{ name: 'certificate-detail', params: { certificateId: it.id } }"
      >
        <div class="cert-card__head">
          <div class="cert-card__icon">
            <i class="pi pi-verified"></i>
          </div>
          <div class="cert-card__title-wrap">
            <div class="cert-card__title">{{ it.productTitle }}</div>
            <div class="cert-card__meta">{{ it.productCode }} · {{ it.artistDisplayName }}</div>
          </div>
          <span class="cert-card__status">{{ it.status }}</span>
        </div>

        <div class="cert-card__info-grid">
          <div>
            <span class="cert-label">Mã đơn</span>
            <strong>{{ it.orderNumber || 'DEMO-CERT' }}</strong>
          </div>
          <div>
            <span class="cert-label">Tài sản số</span>
            <strong>{{ it.assetType || 'Bản quyền số' }}</strong>
          </div>
          <div>
            <span class="cert-label">Người mua</span>
            <strong>{{ it.buyerName || 'Buyer' }}</strong>
          </div>
          <div>
            <span class="cert-label">Ngày cấp</span>
            <strong>{{ new Date(it.createdAt).toLocaleDateString('vi-VN') }}</strong>
          </div>
        </div>

        <div class="cert-card__foot">
          <span class="cert-card__hint">Xem thông tin cơ bản, quyền đã mua và bản demo certificate</span>
          <span class="cert-card__action">Xem chi tiết <i class="pi pi-arrow-right"></i></span>
        </div>
      </RouterLink>
    </div>

    <div v-if="meta" class="cert-pagination">
      <button class="btn btn-ghost btn-sm" type="button" :disabled="!meta.hasPrevPage" @click="prev">Trước</button>
      <div class="muted">Trang {{ meta.page }} / {{ meta.totalPages }}</div>
      <button class="btn btn-ghost btn-sm" type="button" :disabled="!meta.hasNextPage" @click="next">Sau</button>
    </div>
  </div>
</template>

<style scoped>
.cert-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.cert-hero {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  padding: 24px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, #f8fbff, #f5fffc);
  border: 1px solid var(--c-border);
}
.cert-eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .1em;
  color: var(--c-teal-600);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.cert-hero h1 {
  margin: 0;
  font-size: clamp(26px, 4vw, 38px);
}
.cert-hero p {
  margin: 8px 0 0;
  max-width: 720px;
  color: var(--c-text-soft);
  line-height: 1.7;
}
.cert-search {
  display: flex;
  gap: 10px;
  align-items: center;
}
.cert-search .input {
  min-width: 280px;
}
.cert-grid {
  display: grid;
  gap: 14px;
}
.cert-empty {
  padding: 20px;
}
.cert-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--c-border);
  background: #fff;
  box-shadow: var(--shadow-xs);
  transition: transform .2s, box-shadow .2s, border-color .2s;
}
.cert-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  border-color: var(--c-blue-200);
}
.cert-card__head {
  display: flex;
  align-items: center;
  gap: 14px;
}
.cert-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(31,109,240,.1), rgba(20,184,166,.1));
  color: var(--c-blue-600);
  font-size: 20px;
}
.cert-card__title-wrap {
  min-width: 0;
  flex: 1;
}
.cert-card__title {
  font-size: 18px;
  font-weight: 800;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cert-card__meta {
  margin-top: 4px;
  color: var(--c-text-mute);
}
.cert-card__status {
  padding: 6px 10px;
  border-radius: var(--radius-full);
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  color: #047857;
  font-size: 12px;
  font-weight: 800;
}
.cert-card__info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.cert-card__info-grid div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cert-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--c-text-mute);
}
.cert-card__info-grid strong {
  font-size: 14px;
  color: var(--c-text);
}
.cert-card__foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border-top: 1px solid var(--c-border);
  padding-top: 14px;
}
.cert-card__hint {
  color: var(--c-text-soft);
  font-size: 13px;
}
.cert-card__action {
  color: var(--c-blue-600);
  font-weight: 800;
  white-space: nowrap;
}
.cert-pagination {
  margin-top: 4px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}
@media (max-width: 900px) {
  .cert-card__info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .cert-search {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
  .cert-search .input {
    min-width: 0;
  }
  .cert-card__head,
  .cert-card__foot {
    align-items: flex-start;
    flex-direction: column;
  }
  .cert-card__info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
