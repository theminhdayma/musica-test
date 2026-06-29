<script setup>
import { computed, onMounted, ref } from 'vue'
import { useCartStore } from '../stores/cart'
import { formatVND } from '../data/catalog'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../modules/auth/auth.store'
import { hasClientPermission } from '../modules/auth/auth.capabilities'
import EditCartItemModal from '../components/cart/EditCartItemModal.vue'
import ConfirmModal from '../shared/ui/modals/ConfirmModal.vue'

const cart = useCartStore()
const router = useRouter()
const auth = useAuthStore()
const editModalOpen = ref(false)
const duplicateModalOpen = ref(false)
const editingLineId = ref('')
const editingItem = computed(() => cart.items.find((i) => i.lineId === editingLineId.value) || null)
const allSelected = computed(() => cart.allSelected)
const selectedCount = computed(() => cart.selectedCount)

onMounted(() => {
  auth.hydrate()
  void cart.syncAuthState()
})

function goCheckout() {
  if (!cart.hasSelection) return
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

function openEdit(item) {
  editingLineId.value = item?.lineId || ''
  if (!editingLineId.value) return
  editModalOpen.value = true
}

async function onSaveEdit(patch) {
  if (!editingLineId.value) return
  const result = await cart.update(editingLineId.value, patch)
  if (!result?.ok) {
    if (result?.reason === 'duplicate') {
      duplicateModalOpen.value = true
    }
    return
  }
  editModalOpen.value = false
  editingLineId.value = ''
}

async function removeItem(lineId) {
  await cart.remove(lineId)
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

function toggleSelection(lineId) {
  cart.toggleSelection(lineId)
}

function toggleAll() {
  if (cart.allSelected) {
    cart.clearSelection()
    return
  }
  cart.selectAll()
}
</script>

<template>
  <section class="cart-page">
    <div class="container">
      <div class="page-head">
        <span class="eyebrow">Giỏ tác quyền</span>
      </div>

      <div v-if="cart.loading && !cart.hydrated" class="empty-cart">
        <div class="empty-illu">...</div>
        <h3>Đang đồng bộ giỏ hàng</h3>
        <p>Hệ thống đang tải lại các tác quyền bạn đã lưu trên tài khoản.</p>
      </div>

      <div v-else-if="!cart.items.length" class="empty-cart">
        <div class="empty-illu">🎼</div>
        <h3>Giỏ hàng đang trống</h3>
        <p>Hãy bắt đầu khám phá thư viện tác quyền để thêm gói đầu tiên.</p>
        <RouterLink to="/" class="btn btn-primary">Khám phá tác phẩm</RouterLink>
      </div>

      <div v-else class="cart-grid">
        <div class="lines">
          <div class="lines-toolbar">
            <label class="select-all">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleAll"
              />
              <span>Chọn tất cả ({{ cart.count }} mục)</span>
            </label>
            <button v-if="selectedCount" class="toolbar-link" type="button" @click="cart.clearSelection()">Bỏ chọn</button>
          </div>

          <div class="lines-head">
            <span></span>
            <span>Sản phẩm</span>
            <span>Đơn giá</span>
            <span></span>
          </div>

          <transition-group name="line">
            <div v-for="item in cart.items" :key="item.lineId" class="line-row" :class="{ selected: cart.selectedLineIds.includes(item.lineId) }">
              <label class="line-check" :for="`line-${item.lineId}`">
                <input
                  :id="`line-${item.lineId}`"
                  type="checkbox"
                  :checked="cart.selectedLineIds.includes(item.lineId)"
                  @change="toggleSelection(item.lineId)"
                />
              </label>
              <div class="cover" :style="getCoverStyle(item.cover)" aria-hidden="true"></div>
              <div class="info">
                <h3>{{ item.title }}</h3>
                <p class="artist">{{ item.artist }}</p>
                <div class="config">
                  <span v-for="(v, k) in item.configuration" :key="k" class="kv">
                    <i>{{ k }}</i><b>{{ v }}</b>
                  </span>
                </div>
              </div>
              <div class="line-price">
                <span>Đơn giá</span>
                <strong>{{ formatVND(item.price) }}</strong>
              </div>
              <div class="line-actions">
                <button class="icon-action" type="button" aria-label="Sửa" @click="openEdit(item)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                  </svg>
                </button>
                <button class="icon-action remove" type="button" @click="void removeItem(item.lineId)" aria-label="Xoá">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"/>
                    <path d="M8 6V4h8v2"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6"/>
                    <path d="M14 11v6"/>
                  </svg>
                </button>
              </div>
            </div>
          </transition-group>
        </div>

        <aside class="summary">
          <div class="summary-head">
            <div>
              <h3>Xác nhận đơn hàng</h3>
            </div>
            <span class="summary-badge">{{ selectedCount }} mục</span>
          </div>
          <div class="sum-row"><span>Tạm tính</span><b>{{ formatVND(cart.selectedSubtotal) }}</b></div>
          <div class="sum-row"><span>Phí xử lý (4%)</span><b>{{ formatVND(cart.selectedFee) }}</b></div>
          <hr />
          <div class="sum-total"><span>Tổng cộng</span><strong class="gradient-text">{{ formatVND(cart.selectedTotal) }}</strong></div>
          <button class="btn btn-primary btn-lg full" :disabled="!cart.hasSelection" @click="goCheckout">Tiếp tục thanh toán</button>
        </aside>
      </div>

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
.cart-page { padding: 20px 0 48px; }
.page-head { margin-bottom: 14px; }
.eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: var(--radius-full);
  background: #dcfce7;
  color: #15803d;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

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
  grid-template-columns: minmax(0, 1.75fr) minmax(320px, 380px);
  gap: 22px;
  align-items: start;
}
@media (max-width: 920px) { .cart-grid { grid-template-columns: 1fr; } }

.lines { display: flex; flex-direction: column; gap: 14px; }
.lines-toolbar,
.lines-head {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 14px;
  align-items: center;
}
.lines-toolbar {
  margin-bottom: 2px;
}
.select-all {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 700;
  color: var(--c-text);
}
.select-all input,
.line-check input {
  width: 16px;
  height: 16px;
  accent-color: var(--c-teal-500);
}
.toolbar-link {
  margin-left: auto;
  border: none;
  background: transparent;
  color: var(--c-blue-700);
  font-size: 13px;
  font-weight: 700;
}
.lines-head {
  padding: 0 14px 4px;
  color: var(--c-text-mute);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.lines-head span:nth-child(3),
.lines-head span:nth-child(4) {
  justify-self: end;
}
.line-row {
  display: grid;
  grid-template-columns: auto 68px minmax(0, 1fr) auto auto;
  gap: 14px;
  align-items: center;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  transition: box-shadow .25s, border-color .25s, transform .25s;
}
.line-row:hover { box-shadow: var(--shadow-sm); border-color: var(--c-border-strong); }
.line-row.selected {
  border-color: rgba(20, 184, 166, 0.3);
  box-shadow: 0 10px 24px rgba(20, 184, 166, 0.08);
}
.line-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.cover {
  width: 68px; height: 68px;
  border-radius: 12px;
  box-shadow: var(--shadow-xs);
}
.info { min-width: 0; }
.info h3 { margin: 0; font-size: 15px; }
.artist { margin: 2px 0 8px; color: var(--c-text-soft); font-size: 13px; }
.config { display: flex; flex-wrap: wrap; gap: 6px; }
.kv {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 8px;
  background: var(--c-bg-soft);
  border-radius: var(--radius-full);
  font-size: 11px;
}
.kv i { color: var(--c-text-mute); font-style: normal; font-weight: 500; }
.kv b { color: var(--c-blue-700); font-weight: 700; }

.line-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-self: end;
}
.icon-action {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid var(--c-border);
  background: #fff;
  color: var(--c-text-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.icon-action:hover {
  color: var(--c-blue-700);
  border-color: var(--c-blue-300);
  background: #f8fbff;
}
.icon-action.remove:hover {
  color: #c0392b;
  border-color: #ffd5d5;
  background: #fff5f5;
}
.line-price {
  min-width: 110px;
  text-align: right;
}
.line-price span { display: block; font-size: 11px; color: var(--c-text-mute); text-transform: uppercase; letter-spacing: 0.06em; }
.line-price strong { font-size: 16px; color: var(--c-blue-700); font-variant-numeric: tabular-nums; }

.summary {
  position: sticky;
  top: 100px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-md);
}
.summary-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
  margin-bottom: 12px;
}
.summary h3 { margin: 0; font-size: 20px; }
.summary-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 28px;
  padding: 0 10px;
  border-radius: var(--radius-full);
  background: var(--c-blue-50);
  color: var(--c-blue-700);
  font-size: 12px;
  font-weight: 800;
}
.sum-row {
  display: flex; justify-content: space-between;
  font-size: 14px; padding: 7px 0;
  color: var(--c-text-soft);
}
.sum-row b { color: var(--c-text); font-variant-numeric: tabular-nums; }
.summary hr { margin: 12px 0; border: none; border-top: 1px dashed var(--c-border); }
.sum-total {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 14px;
}
.sum-total span { color: var(--c-text-soft); font-weight: 600; }
.sum-total strong { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
.full { width: 100%; }

.line-enter-active, .line-leave-active { transition: opacity .3s, transform .3s; }
.line-enter-from { opacity: 0; transform: translateY(-6px); }
.line-leave-to { opacity: 0; transform: translateX(10px); }

@media (max-width: 640px) {
  .cart-page { padding-top: 12px; }
  .page-head { margin-bottom: 14px; }
  .lines-toolbar,
  .lines-head {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .lines-head {
    display: none;
  }
  .toolbar-link {
    margin-left: 0;
    justify-self: start;
  }
  .line-row { grid-template-columns: auto 56px minmax(0, 1fr); }
  .cover { width: 56px; height: 56px; }
  .line-price,
  .line-actions {
    grid-column: 3;
  }
  .line-actions {
    justify-self: start;
  }
  .line-price { text-align: left; }
}
</style>
