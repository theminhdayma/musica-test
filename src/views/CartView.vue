<script setup>
import { computed, ref } from 'vue'
import { useCartStore } from '../stores/cart'
import { formatVND } from '../data/catalog'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../modules/auth/auth.store'
import { hasClientPermission } from '../modules/auth/auth.capabilities'
import AddProductToCartModal from '../components/cart/AddProductToCartModal.vue'
import EditCartItemModal from '../components/cart/EditCartItemModal.vue'
import ConfirmModal from '../shared/ui/modals/ConfirmModal.vue'

const cart = useCartStore()
const router = useRouter()
const auth = useAuthStore()
const addModalOpen = ref(false)
const editModalOpen = ref(false)
const duplicateModalOpen = ref(false)
const editingLineId = ref('')
const editingItem = computed(() => cart.items.find((i) => i.lineId === editingLineId.value) || null)

function goCheckout() {
  if (!cart.items.length) return
  auth.hydrate()
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: '/checkout' } })
    return
  }
  if (!hasClientPermission({
    isAuthenticated: auth.isAuthenticated,
    roles: auth.roles,
    currentUser: auth.currentUser,
    me: auth.me
  }, 'manage_order')) {
    alert('Tài khoản Buyer hiện không có quyền thao tác đơn hàng.')
    return
  }
  router.push('/checkout')
}

function openAddModal() {
  addModalOpen.value = true
}

function openEdit(item) {
  editingLineId.value = item?.lineId || ''
  if (!editingLineId.value) return
  editModalOpen.value = true
}

function onSaveEdit(patch) {
  if (!editingLineId.value) return
  const result = cart.update(editingLineId.value, patch)
  if (!result?.ok) {
    if (result?.reason === 'duplicate') {
      duplicateModalOpen.value = true
    }
    return
  }
  editModalOpen.value = false
  editingLineId.value = ''
}

function closeEdit() {
  editModalOpen.value = false
  editingLineId.value = ''
}

function getCoverStyle(value) {
  const raw = String(value || '').trim()
  if (!raw) return { background: 'var(--grad-brand)' }
  if (raw.startsWith('http') || raw.startsWith('data:')) {
    return { backgroundImage: `url(${raw})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return { background: raw }
}
</script>

<template>
  <section class="cart-page">
    <div class="container">
      <div class="page-head">
        <div>
          <span class="eyebrow">Giỏ tác quyền</span>
          <h1>Giỏ hàng của bạn</h1>
          <p>Xem lại các gói tác quyền bạn đã cấu hình trước khi ký hợp đồng.</p>
        </div>
        <div class="head-actions">
          <button class="icon-plus" type="button" aria-label="Thêm sản phẩm" @click="openAddModal">+</button>
          <RouterLink to="/" class="btn btn-ghost">← Tiếp tục mua sắm</RouterLink>
        </div>
      </div>

      <div v-if="!cart.items.length" class="empty-cart">
        <div class="empty-illu">🎼</div>
        <h3>Giỏ hàng đang trống</h3>
        <p>Hãy bắt đầu khám phá thư viện tác quyền để thêm gói đầu tiên.</p>
        <RouterLink to="/" class="btn btn-primary">Khám phá tác phẩm</RouterLink>
      </div>

      <div v-else class="cart-grid">
        <div class="lines">
          <transition-group name="line">
            <div v-for="item in cart.items" :key="item.lineId" class="line-row">
              <div class="cover" :style="getCoverStyle(item.cover)" aria-hidden="true"></div>
              <div class="info">
                <div class="line-head">
                  <h3>{{ item.title }}</h3>
                  <div class="line-actions">
                    <button class="edit" type="button" aria-label="Sửa" @click="openEdit(item)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                      </svg>
                    </button>
                    <button class="remove" type="button" @click="cart.remove(item.lineId)" aria-label="Xoá">✕</button>
                  </div>
                </div>
                <p class="artist">{{ item.artist }}</p>
                <div class="config">
                  <span v-for="(v, k) in item.configuration" :key="k" class="kv">
                    <i>{{ k }}</i><b>{{ v }}</b>
                  </span>
                </div>
              </div>
              <div class="line-price">
                <span>Tác quyền</span>
                <strong>{{ formatVND(item.price) }}</strong>
              </div>
            </div>
          </transition-group>
        </div>

        <aside class="summary">
          <h3>Tóm tắt đơn</h3>
          <div class="sum-row"><span>Tạm tính ({{ cart.count }} gói)</span><b>{{ formatVND(cart.subtotal) }}</b></div>
          <div class="sum-row"><span>Phí xử lý & xác minh (4%)</span><b>{{ formatVND(cart.fee) }}</b></div>
          <div class="sum-row promo"><span>Mã giảm giá</span><a href="#">Áp dụng</a></div>
          <hr />
          <div class="sum-total"><span>Tổng cộng</span><strong class="gradient-text">{{ formatVND(cart.total) }}</strong></div>
          <button class="btn btn-primary btn-lg full" @click="goCheckout">Tiến hành ký hợp đồng →</button>
          <ul class="reassure">
            <li>✓ Hợp đồng số có hiệu lực pháp lý</li>
            <li>✓ Nhận đầy đủ bộ tài sản tác quyền tức thì</li>
            <li>✓ Hỗ trợ giải quyết tranh chấp 24/7</li>
          </ul>
        </aside>
      </div>

      <AddProductToCartModal :open="addModalOpen" @close="addModalOpen = false" />

      <EditCartItemModal
        :open="editModalOpen"
        :item="editingItem"
        @close="closeEdit"
        @save="onSaveEdit"
      />

      <ConfirmModal
        :open="duplicateModalOpen"
        title="Sản phẩm đã tồn tại"
        message="Sản phẩm số với cấu hình này đã tồn tại trong giỏ hàng."
        confirm-text="OK"
        cancel-text="Đóng"
        @close="duplicateModalOpen = false"
        @confirm="duplicateModalOpen = false"
      />
    </div>
  </section>
</template>

<style scoped>
.cart-page { padding: 40px 0 80px; }
.page-head { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-bottom: 32px; }
.page-head h1 { margin: 12px 0 6px; font-size: clamp(26px, 3.4vw, 38px); letter-spacing: -0.02em; }
.page-head p { margin: 0; color: var(--c-text-soft); }
.head-actions { display: flex; align-items: center; gap: 10px; }
.icon-plus {
  width: 38px; height: 38px;
  border-radius: 999px;
  border: 1px solid var(--c-border);
  background: #fff;
  font-size: 20px;
  line-height: 1;
  color: var(--c-blue-700);
  display: grid;
  place-items: center;
}
.icon-plus:hover { background: var(--c-bg-soft); border-color: var(--c-border-strong); }

.empty-cart {
  background: #fff;
  border: 1px dashed var(--c-border-strong);
  border-radius: var(--radius-xl);
  padding: 80px 24px;
  text-align: center;
}
.empty-illu { font-size: 48px; margin-bottom: 14px; }
.empty-cart h3 { margin: 0 0 6px; font-size: 22px; }
.empty-cart p { color: var(--c-text-soft); margin: 0 0 22px; }

.cart-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 30px;
  align-items: start;
}
@media (max-width: 920px) { .cart-grid { grid-template-columns: 1fr; } }

.lines { display: flex; flex-direction: column; gap: 14px; }
.line-row {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 18px;
  align-items: center;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  transition: box-shadow .25s, border-color .25s, transform .25s;
}
.line-row:hover { box-shadow: var(--shadow-sm); border-color: var(--c-border-strong); }
.cover {
  width: 80px; height: 80px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
}
.info { min-width: 0; }
.line-head { display: flex; justify-content: space-between; gap: 8px; }
.line-head h3 { margin: 0; font-size: 16px; }
.line-actions { display: flex; align-items: center; gap: 8px; }
.edit {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--c-bg-soft); border: 1px solid var(--c-border);
  color: var(--c-text-soft);
}
.edit:hover { background: #eef6ff; color: var(--c-blue-700); border-color: #cfe1ff; }
.remove {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--c-bg-soft); border: 1px solid var(--c-border);
  color: var(--c-text-soft);
  transition: background .2s, color .2s;
}
.remove:hover { background: #fff0f0; color: #c0392b; border-color: #ffd5d5; }
.artist { margin: 2px 0 10px; color: var(--c-text-soft); font-size: 13.5px; }
.config { display: flex; flex-wrap: wrap; gap: 6px; }
.kv {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 5px 10px;
  background: var(--c-blue-50);
  border-radius: var(--radius-full);
  font-size: 11.5px;
}
.kv i { color: var(--c-text-mute); font-style: normal; font-weight: 500; }
.kv b { color: var(--c-blue-700); font-weight: 700; }

.line-price { text-align: right; }
.line-price span { display: block; font-size: 11px; color: var(--c-text-mute); text-transform: uppercase; letter-spacing: 0.06em; }
.line-price strong { font-size: 16px; color: var(--c-blue-700); font-variant-numeric: tabular-nums; }

.summary {
  position: sticky;
  top: 100px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-md);
}
.summary h3 { margin: 0 0 18px; font-size: 17px; }
.sum-row {
  display: flex; justify-content: space-between;
  font-size: 14px; padding: 8px 0;
  color: var(--c-text-soft);
}
.sum-row b { color: var(--c-text); font-variant-numeric: tabular-nums; }
.sum-row.promo a { color: var(--c-blue-700); font-weight: 600; }
.summary hr { margin: 12px 0; border: none; border-top: 1px dashed var(--c-border); }
.sum-total {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 18px;
}
.sum-total span { color: var(--c-text-soft); font-weight: 600; }
.sum-total strong { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
.full { width: 100%; }

.reassure { list-style: none; padding: 16px 0 0; margin: 16px 0 0; border-top: 1px dashed var(--c-border); }
.reassure li { font-size: 12.5px; color: var(--c-text-soft); padding: 4px 0; }

.line-enter-active, .line-leave-active { transition: opacity .3s, transform .3s; }
.line-enter-from { opacity: 0; transform: translateY(-6px); }
.line-leave-to { opacity: 0; transform: translateX(10px); }
</style>
