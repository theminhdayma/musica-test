<script setup>
import BrandLogo from './BrandLogo.vue'
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="brand-col">
          <BrandLogo :size="36" />
          <p class="tag">Thương mại điện tử tác quyền âm nhạc — kết nối trực tiếp nghệ sĩ với người mua một cách minh bạch, linh hoạt, hợp pháp.</p>
          <div class="socials">
            <a href="#" aria-label="Facebook" class="soc">f</a>
            <a href="#" aria-label="YouTube" class="soc">▶</a>
            <a href="#" aria-label="TikTok" class="soc">♪</a>
            <a href="#" aria-label="Instagram" class="soc">◎</a>
          </div>
        </div>

        <div>
          <h4>Giao dịch</h4>
          <a href="#">Tác quyền YouTube</a>
          <a href="#">Tác quyền biểu diễn</a>
          <a href="#">Tác quyền thương mại</a>
          <a href="#">Tác quyền livestream</a>
        </div>

        <div>
          <h4>Cộng đồng</h4>
          <a href="#">Người mua / Creator</a>
          <a href="#">Nghệ sĩ / Tác giả</a>
          <a href="#">Doanh nghiệp SME</a>
          <a href="#">MCN & Agency</a>
        </div>

        <div>
          <h4>Tổ chức</h4>
          <a href="#">Về MusicA</a>
          <a href="#">Báo chí</a>
          <a href="#">Điều khoản</a>
          <a href="#">Liên hệ</a>
        </div>
      </div>
      <hr class="divider" />
      <div class="legal">
        <span>© {{ new Date().getFullYear() }} MusicA. Mọi quyền được bảo lưu.</span>
        <span class="cert">
          <i class="dot"></i> Hợp đồng số được ký xác thực theo Luật Giao dịch điện tử.
        </span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: 80px;
  background: linear-gradient(180deg, #ffffff 0%, #f3f9fe 100%);
  border-top: 1px solid var(--c-border);
  padding: 60px 0 30px;
}
.footer-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 36px;
}
.brand-col .tag {
  color: var(--c-text-soft);
  margin: 16px 0 18px;
  max-width: 360px;
  line-height: 1.65;
}
.socials { display: flex; gap: 8px; }
.soc {
  width: 36px; height: 36px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: var(--radius-full);
  background: #fff;
  border: 1px solid var(--c-border);
  color: var(--c-blue-600);
  font-weight: 700;
  transition: transform .2s, border-color .2s, color .2s;
}
.soc:hover { transform: translateY(-2px); border-color: var(--c-teal-300); color: var(--c-teal-600); }

h4 { font-size: 14px; margin: 0 0 16px; color: var(--c-text); letter-spacing: 0.02em; }
.footer-grid a { display: block; padding: 6px 0; color: var(--c-text-soft); font-size: 14px; transition: color .2s; }
.footer-grid a:hover { color: var(--c-blue-700); }

.legal {
  margin-top: 26px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--c-text-mute);
  font-size: 13px;
}
.cert { display: inline-flex; align-items: center; gap: 8px; }
.dot { width: 8px; height: 8px; background: var(--c-teal-500); border-radius: 50%; box-shadow: 0 0 0 4px rgba(20,184,166,0.16); animation: pulseRing 2.4s infinite; }

@media (max-width: 880px) {
  .footer-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 540px) {
  .footer-grid { grid-template-columns: 1fr; gap: 28px; }
}
</style>
