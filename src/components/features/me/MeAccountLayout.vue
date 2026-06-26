<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../../modules/auth/auth.store'
import { canAccessArtistArea, canAccessBuyerArea } from '../../../modules/auth/auth.capabilities'

type MeTabKey = 'dashboard' | 'profile' | 'products' | 'certificates' | 'changePassword'

defineProps<{
  active: MeTabKey
}>()

const auth = useAuthStore()
auth.hydrate()

const tabs = computed<Array<{
  key: MeTabKey
  label: string
  to: string
  icon: string
}>>(() => {
  if (canAccessArtistArea(auth.roles)) {
    return [
      { key: 'dashboard', label: 'Dashboard', to: '/me/dashboard', icon: 'pi pi-chart-bar' },
      { key: 'profile', label: 'Trang cá nhân', to: '/me/profile', icon: 'pi pi-user' },
      { key: 'products', label: 'Quản lý sản phẩm', to: '/me/products', icon: 'pi pi-music' },
      { key: 'changePassword', label: 'Đổi mật khẩu', to: '/me/changePassword', icon: 'pi pi-lock' },
    ]
  }

  if (canAccessBuyerArea(auth.roles)) {
    return [
      { key: 'profile', label: 'Trang cá nhân', to: '/me/profile', icon: 'pi pi-user' },
      { key: 'certificates', label: 'Chứng nhận', to: '/me/certificates', icon: 'pi pi-check-circle' },
      { key: 'changePassword', label: 'Đổi mật khẩu', to: '/me/changePassword', icon: 'pi pi-lock' },
    ]
  }

  return []
})
</script>

<template>
  <div class="container section-tight">
    <div class="me-shell">
      <aside class="me-sidebar">
        <div class="me-title">Tài khoản</div>
        <nav class="me-nav" aria-label="Trang cá nhân">
          <RouterLink
            v-for="tab in tabs"
            :key="tab.key"
            :to="tab.to"
            :class="['me-tab', { active: active === tab.key }]"
          >
            <span class="me-tab-icon"><i :class="tab.icon"></i></span>
            <span class="me-tab-label">{{ tab.label }}</span>
            <i class="pi pi-chevron-right me-tab-arrow"></i>
          </RouterLink>
        </nav>
      </aside>

      <section class="me-content">
        <slot />
      </section>
    </div>
  </div>
</template>

<style scoped>
.me-shell {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}
.me-sidebar {
  padding: 16px;
  position: sticky;
  top: 88px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}
.me-title {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 800;
  color: var(--c-text-mute);
  margin-bottom: 10px;
  padding: 0 4px;
}
.me-nav {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.me-tab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--c-text-soft);
  font-weight: 600;
  font-size: 13.5px;
  transition: background .18s, color .18s, border-color .18s;
}
.me-tab:hover {
  background: var(--c-bg-mute);
  color: var(--c-text);
}
.me-tab.active {
  background: var(--c-blue-50);
  border-color: var(--c-blue-100);
  color: var(--c-blue-700);
  font-weight: 700;
}
.me-tab-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
  background: var(--c-bg-mute);
  color: var(--c-text-mute);
  transition: background .18s, color .18s;
}
.me-tab:hover .me-tab-icon {
  background: var(--c-border);
  color: var(--c-text-soft);
}
.me-tab.active .me-tab-icon {
  background: var(--grad-brand);
  color: #fff;
}
.me-tab-label { flex: 1; }
.me-tab-arrow {
  font-size: 10px;
  opacity: 0;
  color: var(--c-blue-400, var(--c-blue-300));
  transition: opacity .18s;
}
.me-tab.active .me-tab-arrow,
.me-tab:hover .me-tab-arrow { opacity: 1; }

.me-content { min-width: 0; }

@media (max-width: 980px) {
  .me-shell { grid-template-columns: minmax(0, 1fr); }
  .me-sidebar { position: static; top: auto; }
  .me-nav { flex-direction: row; flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; gap: 4px; }
  .me-tab { white-space: nowrap; }
  .me-tab-arrow { display: none; }
}
</style>

