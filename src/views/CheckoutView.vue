<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { formatVND } from '../data/catalog'
import { hasClientPermission } from '../modules/auth/auth.capabilities'
import { useAuthStore } from '../modules/auth/auth.store'
import { createOrder, sepayCheckout } from '../modules/orders/api'
import { ApiError } from '../shared/api/errors'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()
const router = useRouter()
const auth = useAuthStore()

const step = ref(1) // 1: review/buyer info, 2: contract + redirect SePay
const steps = ['Thông tin & xem lại', 'Ký hợp đồng tác quyền']

const buyer = ref({
  fullName: '',
  email: '',
  phone: '',
  org: '',
  taxId: '',
  channel: ''
})

const agreed = ref(false)
const drawing = ref(false)
const canvasRef = ref(null)
let ctx = null
let lastPt = null
let hasSignature = ref(false)

function initCanvas() {
  const c = canvasRef.value
  if (!c) return
  const ratio = window.devicePixelRatio || 1
  const w = c.clientWidth, h = c.clientHeight
  c.width = w * ratio
  c.height = h * ratio
  ctx = c.getContext('2d')
  ctx.scale(ratio, ratio)
  ctx.lineWidth = 2.4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#0c1e33'
}
function posFromEvent(e) {
  const c = canvasRef.value
  const r = c.getBoundingClientRect()
  const t = e.touches ? e.touches[0] : e
  return { x: t.clientX - r.left, y: t.clientY - r.top }
}
function down(e) {
  e.preventDefault()
  if (!ctx) initCanvas()
  drawing.value = true
  lastPt = posFromEvent(e)
}
function move(e) {
  if (!drawing.value) return
  e.preventDefault()
  const p = posFromEvent(e)
  ctx.beginPath()
  ctx.moveTo(lastPt.x, lastPt.y)
  ctx.lineTo(p.x, p.y)
  ctx.stroke()
  lastPt = p
  hasSignature.value = true
}
function up() { drawing.value = false; lastPt = null }
function clearSig() {
  if (!ctx) initCanvas()
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  hasSignature.value = false
}

const SEPAY_PAYMENT_METHOD = 'BANK_TRANSFER'

const canNext = computed(() => {
  if (step.value === 1) return !!(buyer.value.fullName && buyer.value.email)
  if (step.value === 2) return hasSignature.value && agreed.value
  return false
})

const processing = ref(false)
const orderError = ref('')
const orderErrorCode = ref('')
const orderErrorRequestId = ref('')
const lastCreatedOrderId = ref('')
const selectedCartItems = computed(() => cart.selectedItems)

function getCoverStyle(value) {
  const raw = String(value || '').trim()
  if (!raw) return { background: 'var(--grad-brand)' }
  if (raw.startsWith('http') || raw.startsWith('data:')) {
    return { backgroundImage: `url(${raw})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return { background: raw }
}

function createIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function canManageOrder() {
  return hasClientPermission({
    isAuthenticated: auth.isAuthenticated,
    roles: auth.roles,
    currentUser: auth.currentUser,
    me: auth.me
  }, 'manage_order')
}

function buildCreateOrderPayload() {
  return {
    buyer: {
      fullName: buyer.value.fullName.trim()
    },
    items: selectedCartItems.value.map((item) => ({
      productId: item.productId,
      quantity: Number(item.qty || 1),
      selectedUsageRights: Array.isArray(item.selectedUsageRights) ? item.selectedUsageRights : [],
      pricingAttributes: item.pricingAttributes && typeof item.pricingAttributes === 'object'
        ? item.pricingAttributes
        : {}
    })),
    payment: {
      provider: 'SEPAY',
      method: SEPAY_PAYMENT_METHOD
    },
    clientContext: {
      source: 'web-checkout',
      gateway: 'sepay'
    }
  }
}

function persistLastOrderId(orderId) {
  lastCreatedOrderId.value = orderId
  try {
    globalThis.sessionStorage?.setItem('last_checkout_order_id', orderId)
  } catch {
  }
}

function submitSepayForm(payload) {
  const form = document.createElement('form')
  form.method = payload.method
  form.action = payload.actionUrl

  for (const [name, value] of Object.entries(payload.fields || {})) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = String(value)
    form.appendChild(input)
  }

  document.body.appendChild(form)
  form.submit()
}

async function payWithSepay() {
  auth.hydrate()
  await cart.syncAuthState()

  if (!auth.isAuthenticated) {
    router.replace({ name: 'login', query: { redirect: '/checkout' } })
    return
  }
  if (!selectedCartItems.value.length) {
    router.replace('/cart')
    return
  }
  if (!canManageOrder()) {
    orderError.value = 'Tài khoản Buyer hiện không có quyền thao tác đơn hàng.'
    return
  }

  processing.value = true
  orderError.value = ''
  orderErrorCode.value = ''
  orderErrorRequestId.value = ''

  try {
    const orderRes = await createOrder(buildCreateOrderPayload(), createIdempotencyKey())
    const orderId = orderRes.data.orderId
    persistLastOrderId(orderId)

    const checkoutRes = await sepayCheckout({
      orderId,
      paymentMethod: SEPAY_PAYMENT_METHOD
    })

    submitSepayForm(checkoutRes.data)
  } catch (error) {
    if (error instanceof ApiError) {
      orderError.value = error.message || 'Không thể khởi tạo thanh toán SePay.'
      orderErrorCode.value = error.code || ''
      orderErrorRequestId.value = error.requestId || ''
    } else if (error instanceof Error) {
      orderError.value = error.message || 'Không thể khởi tạo thanh toán SePay.'
    } else {
      orderError.value = 'Không thể khởi tạo thanh toán SePay.'
    }
  } finally {
    processing.value = false
  }
}

function next() {
  if (!canNext.value) return
  if (step.value < 2) {
    step.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  void payWithSepay()
}
function back() { if (step.value > 1) step.value-- }

onMounted(async () => {
  auth.hydrate()
  await cart.syncAuthState()
  if (auth.accessToken && !auth.me) {
    try {
      await auth.hydrateMe()
    } catch {
    }
  }

  if (!cart.items.length) {
    router.replace('/cart')
    return
  }

  if (!selectedCartItems.value.length) {
    router.replace('/cart')
    return
  }

  buyer.value.fullName = auth.me?.user?.fullName || auth.currentUser?.fullName || ''
  buyer.value.email = auth.me?.user?.email || auth.currentUser?.email || ''
  buyer.value.phone = auth.me?.user?.phoneNumber || ''

  try {
    lastCreatedOrderId.value = globalThis.sessionStorage?.getItem('last_checkout_order_id') || ''
  } catch {
    lastCreatedOrderId.value = ''
  }
})
</script>

<template>
  <section class="checkout-page">
    <div class="container">
      <div class="head">
        <span class="eyebrow">Hoàn tất giao dịch</span>
        <h1>Ký kết & thanh toán</h1>
      </div>

      <!-- Stepper -->
      <div class="stepper">
        <div v-for="(s, i) in steps" :key="i" :class="['step', { active: step === i+1, done: step > i+1 }]">
          <span class="num">{{ step > i+1 ? '✓' : i+1 }}</span>
          <span class="label">{{ s }}</span>
        </div>
      </div>

      <div class="checkout-grid">
        <div class="main">
          <transition name="swap" mode="out-in">
            <!-- STEP 1: Buyer info & review -->
            <div v-if="step === 1" key="s1" class="panel">
              <h2>Thông tin bên mua tác quyền</h2>
              <div class="form-grid">
                <label class="ff"><span>Họ và tên *</span><input v-model="buyer.fullName" type="text" /></label>
                <label class="ff"><span>Email *</span><input v-model="buyer.email" type="email" /></label>
                <label class="ff"><span>Điện thoại</span><input v-model="buyer.phone" type="tel" /></label>
                <label class="ff"><span>Tổ chức / Studio</span><input v-model="buyer.org" type="text" /></label>
                <label class="ff"><span>Mã số thuế</span><input v-model="buyer.taxId" type="text" /></label>
                <label class="ff"><span>Kênh khai thác</span><input v-model="buyer.channel" type="text" /></label>
              </div>

              <h2 class="mt-32">Xem lại các tác quyền đã chọn</h2>
              <div class="review-list">
                <div v-for="item in selectedCartItems" :key="item.lineId" class="rv-item">
                  <div class="rv-cov" :style="getCoverStyle(item.cover)"></div>
                  <div class="rv-body">
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.artist }}</span>
                    <div class="rv-cfg">
                      <span v-for="(v, k) in item.configuration" :key="k">{{ k }}: <b>{{ v }}</b></span>
                    </div>
                  </div>
                  <div class="rv-price">{{ formatVND(item.price) }}</div>
                </div>
              </div>
            </div>

            <!-- STEP 2: Contract signing -->
            <div v-else key="s2" class="panel">
              <h2>Hợp đồng mua tác quyền tác phẩm âm nhạc</h2>
              <p class="panel-sub">Số hợp đồng: <b>MUSA-{{ Date.now().toString(36).toUpperCase().slice(-8) }}</b></p>

              <div class="contract">
                <div class="ct-head">
                  <div>
                    <strong>BÊN BÁN — NGHỆ SĨ / NPH (Bên A)</strong>
                    <span>Đại diện thông qua nền tảng thương mại điện tử MusicA</span>
                  </div>
                  <div>
                    <strong>BÊN MUA (Bên B)</strong>
                    <span>{{ buyer.fullName }} — {{ buyer.org || 'Cá nhân' }}</span>
                  </div>
                </div>

                <div class="ct-body">
                  <h4>Điều 1. Đối tượng giao dịch</h4>
                  <p>Bên A đồng ý thực hiện giao dịch tác quyền với Bên B đối với các tác phẩm âm nhạc liệt kê dưới đây, trong phạm vi, mục đích và thời hạn được nêu cụ thể tại từng gói tác quyền.</p>

                  <table class="ct-table">
                    <thead><tr><th>Tác phẩm</th><th>Tác giả</th><th>Cấu hình</th><th>Phí (₫)</th></tr></thead>
                    <tbody>
                      <tr v-for="i in selectedCartItems" :key="i.lineId">
                        <td>{{ i.title }}</td>
                        <td>{{ i.artist }}</td>
                        <td><span v-for="(v, k) in i.configuration" :key="k" class="td-kv">{{ k }}: <b>{{ v }}</b></span></td>
                        <td class="num">{{ formatVND(i.price) }}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h4>Điều 2. Phạm vi & nghĩa vụ</h4>
                  <p>Bên B được sử dụng tác phẩm trong đúng phạm vi đã cấu hình. Mọi việc khai thác vượt ngoài phạm vi cần đăng ký bổ sung trên nền tảng MusicA.</p>

                  <h4>Điều 3. Bàn giao tài sản</h4>
                  <p>Bên A bàn giao đầy đủ bộ tài sản tác quyền (file âm thanh, khuông nhạc, giấy SHTT…) cho Bên B ngay sau khi hợp đồng có hiệu lực.</p>

                  <h4>Điều 4. Hiệu lực</h4>
                  <p>Hợp đồng có hiệu lực kể từ thời điểm Bên B hoàn tất thanh toán và ký xác thực điện tử.</p>
                </div>

                <div class="ct-foot">
                  <label class="agree">
                    <input v-model="agreed" type="checkbox" />
                    <span>Tôi đã đọc và đồng ý với các điều khoản trong hợp đồng mua tác quyền.</span>
                  </label>

                  <div class="sig-block">
                    <span class="sig-label">Chữ ký số của Bên B</span>
                    <div class="sig-wrap">
                      <canvas
                        ref="canvasRef"
                        @mousedown="down" @mousemove="move" @mouseup="up" @mouseleave="up"
                        @touchstart="down" @touchmove="move" @touchend="up"
                        @pointerenter="initCanvas"
                        width="500" height="140"
                      ></canvas>
                      <span v-if="!hasSignature" class="sig-hint">Ký bằng chuột / cảm ứng tại đây</span>
                      <button v-if="hasSignature" class="sig-clear" @click="clearSig">Xoá ký lại</button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="orderError" class="order-error">
                <div class="oe-title">Không thể khởi tạo thanh toán</div>
                <div class="oe-msg">{{ orderError }}</div>
                <div v-if="orderErrorCode" class="oe-meta">Mã lỗi: <b>{{ orderErrorCode }}</b></div>
                <div v-if="orderErrorRequestId" class="oe-meta">Request ID: <b>{{ orderErrorRequestId }}</b></div>
              </div>
            </div>
          </transition>

          <div class="step-actions">
            <button v-if="step > 1" class="btn btn-ghost" @click="back">← Quay lại</button>
            <button :class="['btn btn-primary btn-lg', { 'is-loading': processing }]" :disabled="!canNext || processing" @click="next">
              <span v-if="!processing">{{ step === 2 ? `Xác nhận và thanh toán ${formatVND(cart.selectedTotal)}` : 'Tiếp tục →' }}</span>
              <span v-else class="spinner"></span>
            </button>
          </div>
        </div>

        <!-- Side summary -->
        <aside class="side">
          <div class="side-card">
            <h3>Tóm tắt đơn</h3>
            <div class="side-items">
              <div v-for="i in selectedCartItems" :key="i.lineId" class="side-item">
                <div class="si-cov" :style="getCoverStyle(i.cover)"></div>
                <div>
                  <strong>{{ i.title }}</strong>
                  <span>{{ i.artist }}</span>
                </div>
                <em>{{ formatVND(i.price) }}</em>
              </div>
            </div>
            <hr />
            <div class="sum-row"><span>Tạm tính</span><b>{{ formatVND(cart.selectedSubtotal) }}</b></div>
            <div class="sum-row"><span>Phí xử lý</span><b>{{ formatVND(cart.selectedFee) }}</b></div>
            <div class="sum-total"><span>Tổng cộng</span><strong class="gradient-text">{{ formatVND(cart.selectedTotal) }}</strong></div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.checkout-page { padding: 36px 0 80px; }
.head h1 { margin: 10px 0 24px; font-size: clamp(26px, 3.4vw, 38px); letter-spacing: -0.02em; }

/* Stepper */
.stepper {
  display: flex;
  align-items: center;
  gap: 0;
  background: #fff;
  padding: 14px 18px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-xs);
  margin-bottom: 28px;
  overflow-x: auto;
}
.stepper .step {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 4px 14px;
  border-radius: var(--radius-full);
  font-size: 13.5px;
  color: var(--c-text-mute);
  font-weight: 600;
  white-space: nowrap;
  position: relative;
}
.stepper .step::after {
  content: ''; display: block;
  width: 36px; height: 2px;
  background: var(--c-border);
  margin-left: 14px;
}
.stepper .step:last-child::after { display: none; }
.stepper .step .num {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: var(--c-bg-mute);
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 700;
  font-size: 12.5px;
  transition: background .3s, color .3s;
}
.stepper .step.active { color: var(--c-text); }
.stepper .step.active .num { background: var(--grad-brand); color: #fff; box-shadow: var(--shadow-glow); }
.stepper .step.done { color: var(--c-teal-600); }
.stepper .step.done .num { background: var(--c-teal-500); color: #fff; }

.checkout-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 28px;
  align-items: start;
}
@media (max-width: 980px) { .checkout-grid { grid-template-columns: 1fr; } }

.panel {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-xl);
  padding: 30px;
}
.panel h2 { margin: 0 0 6px; font-size: 20px; letter-spacing: -0.01em; }
.panel-sub { margin: 0 0 22px; color: var(--c-text-soft); font-size: 14px; }
.mt-32 { margin-top: 32px; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.ff { display: flex; flex-direction: column; gap: 6px; }
.ff.full { grid-column: 1 / -1; }
.ff span { font-size: 12px; color: var(--c-text-soft); font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
.ff input {
  padding: 12px 14px;
  border: 1.5px solid var(--c-border);
  background: var(--c-bg-soft);
  border-radius: var(--radius-md);
  font-size: 14.5px;
  color: var(--c-text);
  font-family: inherit;
  outline: none;
  transition: border-color .25s, background .25s;
}
.ff input:focus { border-color: var(--c-teal-500); background: #fff; }

.review-list { display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
.rv-item {
  display: grid; grid-template-columns: 64px 1fr auto;
  gap: 14px; align-items: center;
  padding: 14px;
  background: var(--c-bg-soft);
  border-radius: var(--radius-md);
}
.rv-cov { width: 64px; height: 64px; border-radius: var(--radius-sm); }
.rv-body strong { display: block; font-size: 14.5px; }
.rv-body span { font-size: 12.5px; color: var(--c-text-soft); }
.rv-cfg { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 4px; font-size: 11.5px; color: var(--c-text-mute); }
.rv-cfg b { color: var(--c-text); font-weight: 600; }
.rv-price { font-weight: 700; color: var(--c-blue-700); font-variant-numeric: tabular-nums; }

/* Contract */
.contract {
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-top: 6px;
}
.ct-head {
  display: grid; grid-template-columns: 1fr 1fr;
  background: var(--c-bg-soft);
  padding: 18px 20px;
  border-bottom: 1px solid var(--c-border);
  gap: 20px;
}
.ct-head strong { display: block; font-size: 12px; color: var(--c-text-mute); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px; }
.ct-head span { font-size: 13.5px; }
.ct-body { padding: 22px; max-height: 320px; overflow: auto; }
.ct-body h4 { margin: 14px 0 6px; font-size: 13.5px; color: var(--c-blue-700); }
.ct-body p { margin: 0 0 6px; font-size: 13.5px; color: var(--c-text-soft); line-height: 1.65; }
.ct-table { width: 100%; border-collapse: collapse; margin: 8px 0 12px; font-size: 12.5px; }
.ct-table th { text-align: left; padding: 8px 10px; background: var(--c-bg-mute); color: var(--c-text-soft); font-weight: 700; }
.ct-table td { padding: 10px; border-top: 1px solid var(--c-border); vertical-align: top; }
.ct-table td.num { text-align: right; font-variant-numeric: tabular-nums; color: var(--c-blue-700); font-weight: 700; }
.td-kv { display: block; font-size: 11.5px; color: var(--c-text-mute); }
.td-kv b { color: var(--c-text); }

.ct-foot { padding: 18px 20px; border-top: 1px solid var(--c-border); background: linear-gradient(180deg, #fff, #f7fbff); }
.agree { display: flex; align-items: start; gap: 10px; cursor: pointer; font-size: 13.5px; }
.agree input { margin-top: 3px; width: 16px; height: 16px; accent-color: var(--c-teal-500); }
.sig-block { margin-top: 18px; }
.sig-label { display: block; font-size: 12px; color: var(--c-text-soft); font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
.sig-wrap {
  position: relative;
  border: 2px dashed var(--c-border-strong);
  border-radius: var(--radius-md);
  background: #fff;
  overflow: hidden;
  transition: border-color .25s;
}
.sig-wrap:hover { border-color: var(--c-teal-500); }
.sig-wrap canvas { width: 100%; height: 140px; display: block; touch-action: none; cursor: crosshair; }
.sig-hint { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--c-text-mute); font-size: 13px; pointer-events: none; }
.sig-clear { position: absolute; top: 8px; right: 8px; background: #fff; border: 1px solid var(--c-border); padding: 4px 10px; border-radius: var(--radius-full); font-size: 11.5px; color: var(--c-text-soft); }

/* Payment */
.order-error {
  margin-top: 16px;
  padding: 12px 14px;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  background: #fff1f2;
  color: #b91c1c;
  font-size: 13px;
}
.oe-title { font-weight: 900; letter-spacing: -0.01em; color: #7f1d1d; }
.oe-msg { margin-top: 4px; }
.oe-meta { margin-top: 6px; color: #9f1239; font-size: 12.5px; }
.oe-meta b { color: #7f1d1d; font-variant-numeric: tabular-nums; }

/* Actions */
.step-actions {
  display: flex; justify-content: space-between; align-items: center;
  gap: 12px;
  margin-top: 22px;
}
.step-actions .btn-primary { margin-left: auto; min-width: 220px; }
.is-loading { opacity: 0.85; cursor: progress; }
.spinner {
  width: 18px; height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.5);
  border-top-color: #fff;
  animation: spinSlow .8s linear infinite;
  display: inline-block;
}

/* Side */
.side-card {
  position: sticky;
  top: 100px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-md);
}
.side-card h3 { margin: 0 0 16px; font-size: 17px; }
.side-items { display: flex; flex-direction: column; gap: 10px; max-height: 260px; overflow: auto; }
.side-item { display: grid; grid-template-columns: 44px 1fr auto; gap: 10px; align-items: center; padding: 8px 0; border-bottom: 1px dashed var(--c-border); font-size: 13px; }
.si-cov { width: 44px; height: 44px; border-radius: 10px; }
.side-item strong { display: block; font-size: 13.5px; }
.side-item span { font-size: 12px; color: var(--c-text-mute); }
.side-item em { font-style: normal; font-weight: 700; color: var(--c-blue-700); font-variant-numeric: tabular-nums; }

.side-card hr { margin: 14px 0; border: none; border-top: 1px dashed var(--c-border); }
.sum-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13.5px; color: var(--c-text-soft); }
.sum-row b { color: var(--c-text); font-variant-numeric: tabular-nums; }
.sum-total { display: flex; justify-content: space-between; align-items: baseline; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--c-border); }
.sum-total span { color: var(--c-text-soft); font-weight: 600; }
.sum-total strong { font-size: 22px; font-weight: 800; }
.swap-enter-active, .swap-leave-active { transition: opacity .3s, transform .3s; }
.swap-enter-from { opacity: 0; transform: translateY(8px); }
.swap-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .ct-head { grid-template-columns: 1fr; }
}
</style>
