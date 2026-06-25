<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getBuyerOrderDetail } from '../modules/orders/api'
import { useCartStore } from '../stores/cart'

const route = useRoute()
const cart = useCartStore()
const order = ref(null)
const loading = ref(false)
const error = ref('')
const paid = ref(false)
let pollTimer = null

const orderId = computed(() => {
  const fromQuery = typeof route.query.orderId === 'string' ? route.query.orderId : ''
  if (fromQuery) return fromQuery
  try {
    return globalThis.sessionStorage?.getItem('last_checkout_order_id') || ''
  } catch {
    return ''
  }
})

async function loadOrderStatus() {
  if (!orderId.value) return

  loading.value = true
  error.value = ''
  try {
    const { data } = await getBuyerOrderDetail(orderId.value)
    order.value = data
    paid.value = data.status === 'PAID'

    if (paid.value) {
      cart.clear()
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
    <div class="container inner">
      <div class="confetti">
        <span v-for="i in 24" :key="i" :style="{ left: (Math.random()*100)+'%', animationDelay: (i*120)+'ms', background: ['#1f6df0','#14b8a6','#5fd9c1','#2aa7d8'][i%4] }"></span>
      </div>

      <div class="badge-success">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 10 18 20 6"/></svg>
      </div>

      <h1>{{ paid ? 'Thanh toán đã được xác nhận' : 'Đã quay về từ SePay' }}</h1>
      <p class="lead">
        {{ paid
          ? 'IPN từ SePay đã được hệ thống ghi nhận. Đơn hàng của bạn đã chuyển sang trạng thái PAID.'
          : 'Hệ thống đang chờ IPN từ SePay để xác nhận thanh toán. Trang này sẽ tự động kiểm tra lại trạng thái order.' }}
      </p>

      <div class="code-box">
        <span>Mã đơn hàng</span>
        <strong>{{ orderId || 'Chưa có orderId' }}</strong>
      </div>

      <p v-if="order" class="status-line">
        Trạng thái hiện tại: <b>{{ order.status }}</b>
        <span v-if="order.paidAt"> · Xác nhận lúc {{ order.paidAt }}</span>
      </p>
      <p v-if="loading && !paid" class="status-line">Đang kiểm tra IPN...</p>
      <p v-if="error" class="error-line">{{ error }}</p>

      <div class="actions">
        <RouterLink to="/" class="btn btn-primary btn-lg">{{ paid ? 'Quay lại marketplace' : 'Tiếp tục chờ xác nhận' }}</RouterLink>
        <RouterLink to="/checkout" class="btn btn-ghost btn-lg">Quay lại checkout</RouterLink>
      </div>

      <div class="next-steps">
        <div class="ns">
          <span class="ns-ic">1</span>
          <div>
            <strong>Callback UX</strong>
            <p>SePay đã redirect trình duyệt của bạn về trang kết quả này ngay sau bước thanh toán.</p>
          </div>
        </div>
        <div class="ns">
          <span class="ns-ic">2</span>
          <div>
            <strong>IPN Server-to-Server</strong>
            <p>Trạng thái paid chỉ được chốt khi backend nhận IPN hoặc webhook hợp lệ từ SePay.</p>
          </div>
        </div>
        <div class="ns">
          <span class="ns-ic">3</span>
          <div>
            <strong>Polling trạng thái</strong>
            <p>Trang này đang gọi API buyer order detail định kỳ để hiển thị lúc order chuyển sang `PAID`.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.success {
  padding: 80px 0 120px;
  position: relative;
  overflow: hidden;
  background: var(--grad-hero);
}
.inner {
  max-width: 760px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}
.badge-success {
  width: 84px; height: 84px;
  border-radius: 50%;
  background: var(--grad-brand);
  color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 24px;
  box-shadow: var(--shadow-glow);
  animation: pulseRing 2.2s infinite;
}
.success h1 { font-size: clamp(28px, 4vw, 44px); letter-spacing: -0.02em; margin: 0 0 12px; }
.lead { color: var(--c-text-soft); margin: 0 auto 26px; max-width: 540px; line-height: 1.7; }

.code-box {
  display: inline-flex; flex-direction: column; align-items: center;
  padding: 14px 28px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: 28px;
}
.code-box span { font-size: 11px; color: var(--c-text-mute); text-transform: uppercase; letter-spacing: 0.08em; }
.code-box strong { font-size: 22px; font-weight: 800; color: var(--c-blue-700); font-variant-numeric: tabular-nums; letter-spacing: 0.04em; }

.status-line { margin: -8px 0 24px; color: var(--c-text-soft); }
.error-line { margin: -8px 0 24px; color: #b91c1c; }

.actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 48px; }

.next-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  text-align: left;
}
.ns {
  display: flex; gap: 12px; align-items: flex-start;
  padding: 18px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  transition: transform .3s, box-shadow .3s;
}
.ns:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.ns-ic { font-size: 24px; }
.ns strong { display: block; font-size: 14px; margin-bottom: 4px; }
.ns p { margin: 0; font-size: 12.5px; color: var(--c-text-soft); line-height: 1.55; }

@media (max-width: 700px) { .next-steps { grid-template-columns: 1fr; } }

/* Confetti */
.confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.confetti span {
  position: absolute;
  top: -10px;
  width: 8px; height: 14px;
  border-radius: 2px;
  opacity: 0.85;
  animation: confettiFall 4s linear infinite;
}
@keyframes confettiFall {
  0% { transform: translateY(0) rotate(0); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
</style>
