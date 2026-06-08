<script setup>
import { RouterLink } from 'vue-router'
const code = 'MUSA-' + Math.random().toString(36).toUpperCase().slice(-8)
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

      <h1>Mua tác quyền thành công 🎉</h1>
      <p class="lead">Hợp đồng số đã được kích hoạt. Bạn có thể tải về bộ tài sản tác quyền và bắt đầu sử dụng tác phẩm theo phạm vi đã mua.</p>

      <div class="code-box">
        <span>Mã giao dịch</span>
        <strong>{{ code }}</strong>
      </div>

      <div class="actions">
        <button class="btn btn-primary btn-lg">⬇ Tải bộ tài sản & hợp đồng</button>
        <RouterLink to="/" class="btn btn-ghost btn-lg">Quay lại Khám phá</RouterLink>
      </div>

      <div class="next-steps">
        <div class="ns">
          <span class="ns-ic">📧</span>
          <div>
            <strong>Email xác nhận</strong>
            <p>Bản sao hợp đồng và hoá đơn VAT đã gửi đến email đăng ký.</p>
          </div>
        </div>
        <div class="ns">
          <span class="ns-ic">🆔</span>
          <div>
            <strong>ID xác minh đa nền tảng</strong>
            <p>Sử dụng ID này khi đăng tải lên YouTube, Facebook, TikTok để được tự động xác minh.</p>
          </div>
        </div>
        <div class="ns">
          <span class="ns-ic">📊</span>
          <div>
            <strong>Quản lý trên Dashboard</strong>
            <p>Theo dõi lượt sử dụng, doanh thu monetize và lịch sử giao dịch.</p>
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
