<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Menu from 'primevue/menu'
import BrandLogo from './BrandLogo.vue'
import { useCartStore } from '../../stores/cart'
import { useAuthStore } from '../../modules/auth/auth.store'
import { canAccessArtistArea, canAccessBuyerArea } from '../../modules/auth/auth.capabilities'

const scrolled = ref(false)
const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()

const count = computed(() => cart.items.reduce((s, i) => s + i.qty, 0))
const isAuthed = computed(() => auth.isAuthenticated)
const isArtist = computed(() => canAccessArtistArea(auth.roles))
const canBuy = computed(() => canAccessBuyerArea(auth.roles))
const displayName = computed(() => {
  const fullName = auth.me?.user?.fullName || auth.currentUser?.fullName
  if (fullName && fullName.trim()) {
    return fullName.trim()
  }

  return auth.me?.user?.email || auth.currentUser?.email || 'bạn'
})

const userMenuRef = ref()
const userMenuItems = computed(() => {
  const items = []
  if (isArtist.value) {
    items.push({
      label: 'Trang cá nhân',
      icon: 'pi pi-user',
      command: () => void router.push({ path: '/me/dashboard' })
    })
  } else if (canBuy.value) {
    items.push({
      label: 'Chứng nhận',
      icon: 'pi pi-check-circle',
      command: () => void router.push({ path: '/me/certificates' })
    })
  }
  items.push(
    {
      label: 'Trợ giúp',
      icon: 'pi pi-question-circle',
      command: () => void router.push({ name: 'help' })
    },
    {
      label: 'Đăng xuất',
      icon: 'pi pi-sign-out',
      command: () => logout()
    }
  )
  return items
})

function toggleUserMenu(event) {
  userMenuRef.value?.toggle?.(event)
}

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
        <RouterLink to="/cart" class="icon-btn cart-btn" aria-label="Giỏ hàng">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.5L22 7H6"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>
          <span v-if="count" class="badge">{{ count }}</span>
        </RouterLink>
        <RouterLink v-if="!isAuthed" to="/login" class="btn btn-ghost btn-sm">Đăng nhập</RouterLink>
        <button v-if="isAuthed" type="button" class="user-menu-btn" @click="toggleUserMenu">
          <span class="user-avatar-ring">
            <span class="user-avatar-letter">{{ displayName.charAt(0).toUpperCase() }}</span>
          </span>
          <span class="user-menu-text">
            <span class="user-menu-hello">Xin chào</span>
            <span class="user-menu-name">{{ displayName }}</span>
          </span>
          <i class="pi pi-chevron-down user-menu-icon" />
        </button>
        <Menu ref="userMenuRef" :model="userMenuItems" popup />
        <button v-if="!isAuthed" class="btn btn-primary btn-sm">Đăng bán tác quyền</button>
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
.hello-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: var(--radius-full);
  background: var(--c-blue-50);
  color: var(--c-blue-700);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}
.hello-name {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-menu-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 13px 5px 5px;
  border-radius: var(--radius-full);
  background: var(--grad-brand);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border: none;
  box-shadow: 0 2px 12px rgba(20, 184, 166, 0.28);
  transition: transform .22s var(--ease-out), box-shadow .22s var(--ease-out);
  white-space: nowrap;
  cursor: pointer;
}
.user-menu-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 22px rgba(20, 184, 166, 0.38);
}
.user-avatar-ring {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.user-avatar-letter {
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}
.user-menu-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}
.user-menu-hello {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255,255,255,0.75);
  letter-spacing: 0.04em;
}
.user-menu-name {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}
.user-menu-icon { font-size: 10px; opacity: 0.75; margin-left: 1px; }

/* PrimeVue Menu dropdown override */
:deep(.p-menu) {
  border: 1px solid var(--c-border) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: var(--shadow-md) !important;
  padding: 6px !important;
  min-width: 190px !important;
  background: #fff !important;
  font-family: var(--font-sans) !important;
}
:deep(.p-menuitem) {
  border-radius: var(--radius-sm) !important;
  overflow: hidden;
}
:deep(.p-menuitem-link) {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 9px 12px !important;
  border-radius: var(--radius-sm) !important;
  color: var(--c-text-soft) !important;
  font-weight: 600 !important;
  font-size: 13.5px !important;
  transition: background .15s, color .15s !important;
}
:deep(.p-menuitem-link:hover),
:deep(.p-menuitem-link:focus) {
  background: var(--c-bg-mute) !important;
  color: var(--c-text) !important;
}
:deep(.p-menuitem-link .p-menuitem-icon) {
  color: var(--c-text-mute) !important;
  font-size: 14px !important;
  margin: 0 !important;
}
:deep(.p-menuitem-link:hover .p-menuitem-icon) {
  color: var(--c-blue-500) !important;
}
:deep(.p-menuitem-link .p-menuitem-text) {
  font-family: var(--font-sans) !important;
}
/* Đăng xuất — highlight đỏ nhẹ */
:deep(.p-menuitem:last-child .p-menuitem-link) {
  color: #b42318 !important;
}
:deep(.p-menuitem:last-child .p-menuitem-link:hover) {
  background: #fff1f0 !important;
  color: #b42318 !important;
}
:deep(.p-menuitem:last-child .p-menuitem-link .p-menuitem-icon) {
  color: #fca5a5 !important;
}
:deep(.p-menuitem:last-child .p-menuitem-link:hover .p-menuitem-icon) {
  color: #b42318 !important;
}
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
}
@media (max-width: 640px) {
  .hello-chip { display: none; }
  .nav-actions .btn-ghost { display: none; }
  .nav-actions .btn-primary { display: none; }
  .header-inner { gap: 12px; }
}
</style>
