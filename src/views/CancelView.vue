<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const orderId = computed(() => typeof route.query.orderId === 'string' ? route.query.orderId : '')
</script>

<template>
  <section class="result-page">
    <div class="container result-card">
      <div class="badge cancel">-</div>
      <h1>Bạn đã huỷ giao dịch</h1>
      <p class="lead">
        Không có trạng thái paid nào được ghi nhận. Bạn có thể quay lại checkout để tiếp tục thanh toán đơn hàng khi sẵn sàng.
      </p>
      <p v-if="orderId" class="order-line">Order: <b>{{ orderId }}</b></p>
      <div class="actions">
        <RouterLink to="/checkout" class="btn btn-primary btn-lg">Quay lại checkout</RouterLink>
        <RouterLink to="/" class="btn btn-ghost btn-lg">Về marketplace</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.result-page { padding: 80px 0 120px; background: var(--grad-hero); min-height: 70vh; }
.result-card { max-width: 720px; margin: 0 auto; text-align: center; background: #fff; border: 1px solid var(--c-border); border-radius: var(--radius-xl); padding: 40px 28px; box-shadow: var(--shadow-md); }
.badge { width: 72px; height: 72px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 34px; font-weight: 800; margin-bottom: 18px; color: #fff; }
.badge.cancel { background: #6b7280; }
.lead { color: var(--c-text-soft); max-width: 520px; margin: 0 auto 20px; line-height: 1.7; }
.order-line { color: var(--c-text-soft); margin-bottom: 24px; }
.actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
</style>
