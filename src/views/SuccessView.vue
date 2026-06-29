<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { getBuyerOrderDetail } from '../modules/orders/api'
import { useCartStore } from '../stores/cart'
import BaseModal from '../shared/ui/modals/BaseModal.vue'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const order = ref(null)
const loading = ref(false)
const error = ref('')
const paid = ref(false)
const showSuccessModal = ref(false)
let pollTimer = null

const RECENT_PURCHASE_CERTIFICATES_KEY = 'recent_purchase_certificates'
const SUCCESS_MODAL_SEEN_PREFIX = 'success_modal_seen_'

function formatCurrency(value, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(Number(value || 0))
}

function formatDateTime(value) {
  if (!value) return 'Đang cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Đang cập nhật'
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

function mapUsageRights(value) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean)
}

function mapPricingAttributes(value) {
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).map(([key, raw]) => ({
    key,
    label: `${String(key).replaceAll('_', ' ')}: ${String(raw)}`
  }))
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(
    value
      .map((item) => String(item || '').trim())
      .filter(Boolean)
  )].sort()
}

function normalizePricingAttributes(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, itemValue]) => [String(key), itemValue == null ? '' : String(itemValue)])
      .sort(([left], [right]) => left.localeCompare(right))
  )
}

function buildCartMatchSignature(item) {
  return JSON.stringify({
    productId: String(item?.productId || ''),
    selectedUsageRights: normalizeStringArray(item?.selectedUsageRights || item?.selectedUsageRightsSnapshot),
    pricingAttributes: normalizePricingAttributes(item?.pricingAttributes || item?.pricingAttributesSnapshot),
  })
}

async function removePurchasedCartItems(data) {
  await cart.syncAuthState()
  const purchasedSignatures = new Set(
    (Array.isArray(data?.items) ? data.items : []).map((item) => buildCartMatchSignature(item))
  )
  const removableIds = cart.items
    .filter((item) => purchasedSignatures.has(buildCartMatchSignature(item)))
    .map((item) => item.lineId)

  if (!removableIds.length) return
  await cart.removeMany(removableIds)
}

function buildCertificateDemoPayload(data) {
  const paymentMethod = data?.payment?.provider || 'SePay'
  const issuedAt = data?.paidAt || data?.createdAt || new Date().toISOString()
  return (Array.isArray(data?.items) ? data.items : []).map((item, index) => ({
    id: `${data.id}-${index + 1}`,
    orderId: data.id,
    orderNumber: data.orderNumber,
    productId: item.productId,
    productCode: `CERT-${String(item.productId || '').slice(0, 8).toUpperCase()}`,
    productTitle: item.title,
    artistDisplayName: 'MusicA Marketplace',
    status: 'ACTIVE',
    validFrom: issuedAt,
    validUntil: null,
    createdAt: issuedAt,
    paymentMethodLabel: paymentMethod,
    buyerName: data?.buyerSnapshotName || data?.buyer?.fullName || null,
    assetType: 'Bản quyền số',
    rightsSummary: mapUsageRights(item.selectedUsageRightsSnapshot),
    pricingAttributesSummary: mapPricingAttributes(item.pricingAttributesSnapshot),
    contractVersion: '1.0',
    licenseType: 'Giấy phép khai thác tài sản số',
    issuedAt,
    purchasedAssets: [
      {
        productId: item.productId,
        productTitle: item.title,
        unitPrice: Number(item.unitPrice || 0),
        quantity: Number(item.quantity || 1),
        lineTotalAmount: Number(item.lineTotalAmount || 0),
        selectedUsageRights: mapUsageRights(item.selectedUsageRightsSnapshot),
        pricingAttributes: mapPricingAttributes(item.pricingAttributesSnapshot)
      }
    ]
  }))
}

function persistRecentCertificates(data) {
  try {
    globalThis.sessionStorage?.setItem(
      RECENT_PURCHASE_CERTIFICATES_KEY,
      JSON.stringify(buildCertificateDemoPayload(data))
    )
  } catch {
  }
}

function closeSuccessModal() {
  showSuccessModal.value = false
}

function shouldOpenSuccessModal(currentOrderId) {
  try {
    return globalThis.sessionStorage?.getItem(`${SUCCESS_MODAL_SEEN_PREFIX}${currentOrderId}`) !== '1'
  } catch {
    return true
  }
}

function markSuccessModalSeen(currentOrderId) {
  try {
    globalThis.sessionStorage?.setItem(`${SUCCESS_MODAL_SEEN_PREFIX}${currentOrderId}`, '1')
  } catch {
  }
}

function goToCertificates() {
  showSuccessModal.value = false
  void router.push({ name: 'my-certificates' })
}

const orderId = computed(() => {
  const fromQuery = typeof route.query.orderId === 'string' ? route.query.orderId : ''
  if (fromQuery) return fromQuery
  try {
    return globalThis.sessionStorage?.getItem('last_checkout_order_id') || ''
  } catch {
    return ''
  }
})

const displayOrderNumber = computed(() => order.value?.orderNumber || orderId.value || 'Đang cập nhật')
const displayPaidAt = computed(() => formatDateTime(order.value?.paidAt || order.value?.createdAt))
const displayAmount = computed(() => formatCurrency(order.value?.amounts?.totalAmount, order.value?.currency || 'VND'))
const purchasedItems = computed(() => Array.isArray(order.value?.items) ? order.value.items : [])

async function loadOrderStatus() {
  if (!orderId.value) return

  loading.value = true
  error.value = ''
  try {
    const { data } = await getBuyerOrderDetail(orderId.value)
    order.value = data
    paid.value = data.status === 'PAID'

    if (paid.value) {
      try {
        await removePurchasedCartItems(data)
      } catch {
      }
      persistRecentCertificates(data)
      if (shouldOpenSuccessModal(data.id)) {
        showSuccessModal.value = true
        markSuccessModalSeen(data.id)
      }
      try {
        globalThis.sessionStorage?.removeItem('last_checkout_order_id')
      } catch {
      }
      if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
      }
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Không thể tải trạng thái đơn hàng.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!orderId.value) return
  void loadOrderStatus()
  pollTimer = setInterval(() => {
    void loadOrderStatus()
  }, 3000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <section class="success">
    <BaseModal
      :open="showSuccessModal"
      title="Mua bản quyền thành công"
      :close-on-backdrop="true"
      @close="closeSuccessModal"
    >
      <div class="success-modal">
        <div class="success-modal__icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 22C17.523 22 22 17.523 22 12S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
              fill="currentColor"
              opacity="0.12"
            />
            <path
              d="M8 12.5L10.8 15.3L16.5 9.5"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <span class="success-modal__eyebrow">Giao dịch đã hoàn tất</span>
        <h2>Bạn đã mua bản quyền thành công</h2>
        <p>
          Đơn hàng <strong>{{ displayOrderNumber }}</strong> đã được xác nhận.
          Bạn có thể đóng thông báo hoặc vào trang certificate để xem tài sản vừa mua.
        </p>
        <div class="success-modal__code">{{ displayOrderNumber }}</div>
      </div>
      <template #footer>
        <button class="btn btn-ghost" type="button" @click="closeSuccessModal">Đóng</button>
        <button class="btn btn-primary" type="button" @click="goToCertificates">Xem certificate</button>
      </template>
    </BaseModal>

    <div class="container inner">
      <div class="hero-panel">
        <div class="hero-panel__copy">
          <div class="hero-panel__meta">
            <span class="status-chip" :class="{ pending: !paid }">
              {{ paid ? 'Thanh toán thành công' : 'Đang chờ xác nhận' }}
            </span>
            <span class="hero-panel__order">{{ displayOrderNumber }}</span>
          </div>
          <h1>{{ paid ? 'Giao dịch bản quyền đã được xác nhận' : 'Hệ thống đang kiểm tra giao dịch' }}</h1>
          <p class="lead">
            {{ paid
              ? 'Thanh toán đã được ghi nhận. Bạn có thể xem certificate hoặc tiếp tục tìm kiếm tài sản phù hợp khác.'
              : 'Nếu bạn đã thanh toán, trang này sẽ tự động cập nhật ngay khi giao dịch được xác nhận.' }}
          </p>
          <div class="actions hero-panel__actions">
            <button v-if="paid" class="btn btn-primary" type="button" @click="goToCertificates">
              Xem certificate
            </button>
            <RouterLink to="/" class="btn" :class="paid ? 'btn-ghost' : 'btn-primary'">
              {{ paid ? 'Về marketplace' : 'Về trang chủ' }}
            </RouterLink>
            <RouterLink v-if="!paid" to="/checkout" class="btn btn-ghost">Quay lại checkout</RouterLink>
          </div>
          <p v-if="loading && !paid" class="status-line">Đang kiểm tra giao dịch...</p>
          <p v-if="error" class="error-line">{{ error }}</p>
        </div>

        <div class="badge-success" :class="{ pending: !paid }">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polyline v-if="paid" points="4 12 10 18 20 6" />
            <path v-else d="M12 7v5l3 3" />
            <circle v-if="!paid" cx="12" cy="12" r="8" />
          </svg>
        </div>
      </div>

      <div class="content-grid">
        <div class="summary-card">
          <div class="card-head">
            <h2>Tóm tắt giao dịch</h2>
          </div>
          <div class="summary-list">
            <div class="summary-row">
              <span>Mã đơn hàng</span>
              <strong>{{ displayOrderNumber }}</strong>
            </div>
            <div class="summary-row">
              <span>Trạng thái</span>
              <strong>{{ order?.status || (paid ? 'PAID' : 'PENDING_PAYMENT') }}</strong>
            </div>
            <div class="summary-row">
              <span>{{ paid ? 'Thời gian xác nhận' : 'Thời gian tạo đơn' }}</span>
              <strong>{{ displayPaidAt }}</strong>
            </div>
            <div class="summary-row">
              <span>Tổng thanh toán</span>
              <strong>{{ displayAmount }}</strong>
            </div>
          </div>
        </div>

        <div v-if="purchasedItems.length" class="purchase-card">
          <div class="section-head">
            <h2>Tài sản đã mua</h2>
            <span>{{ purchasedItems.length }} mục</span>
          </div>
          <div class="purchase-list">
            <article v-for="item in purchasedItems" :key="`${item.productId}-${item.title}`" class="purchase-item">
              <div class="purchase-item__body">
                <strong>{{ item.title }}</strong>
                <p>
                  Bản quyền số
                  <span v-if="item.quantity > 1"> · Số lượng {{ item.quantity }}</span>
                </p>
              </div>
              <div class="purchase-item__meta">
                <strong>{{ formatCurrency(item.lineTotalAmount, order?.currency || 'VND') }}</strong>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.success {
  padding: 28px 0 44px;
  position: relative;
  background:
    radial-gradient(circle at top, rgba(95, 217, 193, 0.08), transparent 30%),
    linear-gradient(180deg, #f7fbff 0%, #ffffff 52%);
}
.inner {
  max-width: 1120px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}
.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 56px;
  gap: 16px;
  align-items: start;
  padding: 18px 20px;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 24px;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);
}
.hero-panel__copy {
  min-width: 0;
}
.hero-panel__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.hero-panel__order {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.14);
  color: var(--c-text);
  font-size: 12px;
  font-weight: 700;
}
.hero-panel__actions {
  margin-top: 14px;
}
.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(20, 184, 166, 0.12);
  color: #0f766e;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.status-chip.pending {
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}
.badge-success {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6, #1f6df0);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 14px 30px rgba(31, 109, 240, 0.16);
  justify-self: end;
}
.badge-success.pending {
  background: linear-gradient(135deg, #60a5fa, #2563eb);
}
.success h1 {
  font-size: clamp(24px, 2.6vw, 32px);
  letter-spacing: -0.03em;
  margin: 0;
  max-width: 760px;
}
.lead {
  color: var(--c-text-soft);
  margin: 8px 0 0;
  max-width: 720px;
  line-height: 1.55;
  font-size: 14px;
}
.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.25fr);
  gap: 16px;
  align-items: start;
}
.summary-card,
.purchase-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);
}
.summary-card {
  overflow: hidden;
}
.card-head,
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}
.card-head h2,
.section-head h2 {
  margin: 0;
  font-size: 17px;
  letter-spacing: -0.02em;
}
.summary-list {
  display: grid;
}
.summary-row {
  padding: 14px 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
}
.summary-row span {
  font-size: 13px;
  color: var(--c-text-mute);
}
.summary-row strong {
  font-size: 14px;
  color: var(--c-text);
  word-break: break-word;
  text-align: right;
}
.summary-row:last-child {
  border-bottom: 0;
}
.purchase-card {
  text-align: left;
}
.section-head span {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(20, 184, 166, 0.1);
  color: #0f766e;
  font-size: 11px;
  font-weight: 700;
}
.purchase-list {
  display: grid;
  gap: 10px;
  padding: 12px;
  max-height: 360px;
  overflow: auto;
}
.purchase-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.12);
}
.purchase-item__body strong {
  display: block;
  margin-bottom: 3px;
  font-size: 14px;
}
.purchase-item__body p {
  margin: 0;
  color: var(--c-text-soft);
  font-size: 13px;
}
.purchase-item__meta strong {
  font-size: 14px;
  color: var(--c-text);
}

.status-line {
  margin: 10px 0 0;
  color: var(--c-text-soft);
  font-size: 13px;
}
.error-line {
  margin: 10px 0 0;
  color: #b91c1c;
  font-size: 13px;
}
.actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  flex-wrap: wrap;
}

.success-modal {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  padding: 6px 4px;
}
.success-modal__icon {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(20,184,166,0.12), rgba(31,109,240,0.12));
  color: var(--c-teal-600);
}
.success-modal__icon svg {
  width: 36px;
  height: 36px;
}
.success-modal__eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(20, 184, 166, 0.1);
  color: #0f766e;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.success-modal__code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 14px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.16);
  color: var(--c-blue-700);
  font-size: 14px;
  font-weight: 800;
  word-break: break-word;
}
.success-modal h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  color: var(--c-text);
  letter-spacing: -0.02em;
}
.success-modal p {
  margin: 0;
  color: var(--c-text-soft);
  line-height: 1.6;
  max-width: 420px;
  font-size: 14px;
}

@media (max-width: 700px) {
  .success {
    padding: 18px 0 28px;
  }
  .hero-panel {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 16px;
  }
  .badge-success {
    width: 44px;
    height: 44px;
    justify-self: start;
  }
  .content-grid {
    grid-template-columns: 1fr;
  }
  .summary-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .summary-row strong {
    text-align: left;
  }
  .purchase-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .purchase-list {
    max-height: none;
  }
}
</style>
