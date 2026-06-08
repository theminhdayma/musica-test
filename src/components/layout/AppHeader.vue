<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BrandLogo from './BrandLogo.vue'
import HeaderSearch from './HeaderSearch.vue'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../modules/auth/auth.store'

const scrolled = ref(false)
const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()

const count = computed(() => cart.items.reduce((s, i) => s + i.qty, 0))
const isAuthed = computed(() => auth.isAuthenticated)
const isBuyer = computed(() => auth.roles.includes('BUYER'))
const isArtist = computed(() => auth.roles.includes('ARTIST'))

function logout() {
  auth.logout()
  router.push({ name: 'home' })
}

function onScroll() { scrolled.value = window.scrollY > 12 }
onMounted(() => { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }) })
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header :class="['site-header', { scrolled }]">
    <div class="container header-inner">
      <RouterLink to="/" class="logo-link" aria-label="MusicA home">
        <BrandLogo :size="32" />
      </RouterLink>

      <nav class="nav-main" aria-label="Primary">
        <RouterLink to="/" class="nav-link">Khám phá</RouterLink>
        <RouterLink to="/market" class="nav-link">Marketplace</RouterLink>
        <a href="#categories" class="nav-link">Thể loại</a>
        <a href="#artists" class="nav-link">Nghệ sĩ</a>
        <a href="#pricing" class="nav-link">Bảng giá</a>
      </nav>

      <div class="nav-actions">
        <HeaderSearch class="header-search" />
        <RouterLink to="/cart" class="icon-btn cart-btn" aria-label="Giỏ hàng">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.5L22 7H6"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>
          <span v-if="count" class="badge">{{ count }}</span>
        </RouterLink>
        <RouterLink v-if="!isAuthed" to="/login" class="btn btn-ghost btn-sm">Đăng nhập</RouterLink>
        <RouterLink v-if="isAuthed && isBuyer" to="/me/certificates" class="btn btn-ghost btn-sm">Chứng nhận</RouterLink>
        <RouterLink v-if="isAuthed && isArtist" to="/me/products" class="btn btn-ghost btn-sm">Tác phẩm</RouterLink>
        <button v-if="isAuthed" class="btn btn-ghost btn-sm" type="button" @click="logout">Đăng xuất</button>
        <button class="btn btn-primary btn-sm">Đăng bán tác quyền</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: saturate(160%) blur(14px);
  -webkit-backdrop-filter: saturate(160%) blur(14px);
  background: rgba(255,255,255,0.72);
  border-bottom: 1px solid transparent;
  transition: background .3s var(--ease-out), border-color .3s var(--ease-out), box-shadow .3s var(--ease-out);
}
.site-header.scrolled {
  background: rgba(255,255,255,0.92);
  border-bottom-color: var(--c-border);
  box-shadow: var(--shadow-xs);
}
.header-inner {
  display: flex;
  align-items: center;
  height: 72px;
  gap: 32px;
}
.logo-link { display: inline-flex; align-items: center; }
.nav-main {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 16px;
  flex-wrap: nowrap;
  white-space: nowrap;
}
.nav-link {
  padding: 8px 14px;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 14px;
  color: var(--c-text-soft);
  transition: background .2s, color .2s;
  white-space: nowrap;
}
.nav-link:hover { background: var(--c-bg-mute); color: var(--c-text); }
.nav-link.router-link-exact-active { color: var(--c-blue-700); background: var(--c-blue-50); }

.nav-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-search { margin-right: 6px; }
.icon-btn {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid var(--c-border);
  color: var(--c-text);
  transition: border-color .2s, color .2s, transform .2s;
}
.icon-btn:hover { color: var(--c-blue-600); border-color: var(--c-blue-300); transform: translateY(-1px); }
.cart-btn .badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--grad-brand);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-xs);
}

@media (max-width: 960px) {
  .nav-main { display: none; }
  .header-inner { flex-wrap: wrap; height: auto; padding: 12px 0; }
  .nav-actions { width: 100%; margin-left: 0; }
  .header-search { flex: 1; margin-right: 0; }
}
@media (max-width: 640px) {
  .nav-actions .btn-ghost { display: none; }
  .nav-actions .btn-primary { display: none; }
  .header-inner { gap: 12px; }
}
</style>
