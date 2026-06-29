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
  <div class="container section cert-detail-page">
    <button class="btn btn-ghost btn-sm" type="button" @click="router.back()">← Quay lại</button>

    <div class="cert-detail-body">
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

      <div v-else-if="item" class="cert-detail-shell">
        <div class="card cert-overview">
          <div class="cert-overview__hero">
            <div>
              <div class="cert-overview__eyebrow">Certificate Demo</div>
              <h1>{{ item.productTitle }}</h1>
              <div class="muted">{{ item.productCode }} · {{ item.artistDisplayName }}</div>
            </div>
            <div class="cert-status-chip">{{ item.status }}</div>
          </div>

          <div class="cert-summary-grid">
            <div>
              <span class="cert-key">Mã đơn hàng</span>
              <strong>{{ item.orderNumber || 'DEMO-CERT' }}</strong>
            </div>
            <div>
              <span class="cert-key">Người mua</span>
              <strong>{{ item.buyerName || 'Buyer' }}</strong>
            </div>
            <div>
              <span class="cert-key">Loại tài sản</span>
              <strong>{{ item.assetType || 'Bản quyền số' }}</strong>
            </div>
            <div>
              <span class="cert-key">Ngày cấp</span>
              <strong>{{ new Date(item.issuedAt || item.createdAt).toLocaleString('vi-VN') }}</strong>
            </div>
            <div>
              <span class="cert-key">Phiên bản hợp đồng</span>
              <strong>{{ item.contractVersion || '1.0' }}</strong>
            </div>
            <div>
              <span class="cert-key">Phương thức thanh toán</span>
              <strong>{{ item.paymentMethodLabel || 'SePay' }}</strong>
            </div>
          </div>

          <div class="cert-section">
            <div class="cert-section__title">Thông tin hợp đồng</div>
            <div class="cert-contract-grid">
              <div>
                <span class="cert-key">License</span>
                <strong>{{ item.licenseType || 'Giấy phép khai thác tài sản số' }}</strong>
              </div>
              <div>
                <span class="cert-key">Hiệu lực từ</span>
                <strong>{{ new Date(item.validFrom).toLocaleString('vi-VN') }}</strong>
              </div>
              <div>
                <span class="cert-key">Hiệu lực đến</span>
                <strong>{{ item.validUntil ? new Date(item.validUntil).toLocaleString('vi-VN') : 'Không thời hạn' }}</strong>
              </div>
              <div>
                <span class="cert-key">Trạng thái</span>
                <strong>{{ item.status }}</strong>
              </div>
            </div>
          </div>

          <div class="cert-section">
            <div class="cert-section__title">Tài sản số đã mua</div>
            <div v-if="item.purchasedAssets?.length" class="asset-list">
              <div v-for="asset in item.purchasedAssets" :key="`${item.id}-${asset.productId}`" class="asset-card">
                <div class="asset-card__head">
                  <strong>{{ asset.productTitle }}</strong>
                  <span>{{ asset.quantity }} x {{ asset.unitPrice.toLocaleString('vi-VN') }} đ</span>
                </div>
                <div class="asset-card__amount">Tổng: {{ asset.lineTotalAmount.toLocaleString('vi-VN') }} đ</div>

                <div class="asset-card__block">
                  <div class="asset-card__label">Quyền đã mua</div>
                  <div class="asset-chip-wrap">
                    <span v-for="right in asset.selectedUsageRights" :key="right" class="asset-chip">{{ right }}</span>
                    <span v-if="!asset.selectedUsageRights.length" class="muted">Chưa có quyền chi tiết</span>
                  </div>
                </div>

                <div class="asset-card__block">
                  <div class="asset-card__label">Cấu hình đã chọn</div>
                  <div class="asset-chip-wrap">
                    <span v-for="pricing in asset.pricingAttributes" :key="pricing.key" class="asset-chip asset-chip--soft">{{ pricing.label }}</span>
                    <span v-if="!asset.pricingAttributes.length" class="muted">Không có cấu hình bổ sung</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="muted">Chưa có dữ liệu tài sản số trong bản demo này.</div>
          </div>

          <div class="cert-section">
            <div class="cert-section__title">Tóm tắt quyền sử dụng</div>
            <div class="asset-chip-wrap">
              <span v-for="right in item.rightsSummary || []" :key="right" class="asset-chip">{{ right }}</span>
              <span v-if="!(item.rightsSummary || []).length" class="muted">Sẽ được bổ sung khi backend certificate hoàn chỉnh.</span>
            </div>
          </div>

          <button class="btn btn-primary btn-sm" type="button" :disabled="downloading" @click="download">
            <span v-if="downloading">Đang tạo link tải…</span>
            <span v-else>Tải chứng nhận (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cert-detail-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cert-detail-body {
  margin-top: 12px;
}
.cert-detail-shell {
  display: grid;
  gap: 16px;
}
.cert-overview {
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-xs);
}
.cert-overview__hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}
.cert-overview__eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .1em;
  color: var(--c-teal-600);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.cert-overview h1 {
  margin: 0 0 6px;
  font-size: clamp(26px, 4vw, 40px);
}
.cert-status-chip {
  padding: 8px 12px;
  border-radius: var(--radius-full);
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  color: #047857;
  font-weight: 800;
  white-space: nowrap;
}
.cert-summary-grid,
.cert-contract-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}
.cert-summary-grid div,
.cert-contract-grid div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.cert-key {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--c-text-mute);
}
.cert-summary-grid strong,
.cert-contract-grid strong {
  color: var(--c-text);
}
.cert-section {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--c-border);
}
.cert-section__title {
  font-size: 16px;
  font-weight: 800;
  color: var(--c-text);
  margin-bottom: 14px;
}
.asset-list {
  display: grid;
  gap: 14px;
}
.asset-card {
  padding: 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--c-border);
  background: var(--c-bg-soft);
  display: grid;
  gap: 12px;
}
.asset-card__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}
.asset-card__head strong {
  font-size: 15px;
}
.asset-card__amount {
  color: var(--c-blue-600);
  font-weight: 800;
}
.asset-card__block {
  display: grid;
  gap: 8px;
}
.asset-card__label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--c-text-mute);
}
.asset-chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.asset-chip {
  padding: 6px 10px;
  border-radius: var(--radius-full);
  background: #e8f7f3;
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
}
.asset-chip--soft {
  background: #eef4ff;
  color: #1d4ed8;
}
@media (max-width: 900px) {
  .cert-summary-grid,
  .cert-contract-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .cert-overview__hero,
  .asset-card__head {
    flex-direction: column;
  }
  .cert-summary-grid,
  .cert-contract-grid {
    grid-template-columns: 1fr;
  }
}
</style>
