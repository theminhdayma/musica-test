<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const isDark = ref(false)

const applyTheme = (value: boolean) => {
  isDark.value = value
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('app-dark', value)
  try {
    localStorage.setItem('app-dark', value ? '1' : '0')
  } catch {
    return
  }
}

onMounted(() => {
  try {
    const saved = localStorage.getItem('app-dark')
    applyTheme(saved === '1')
  } catch {
    applyTheme(false)
  }
})

const label = computed(() => (isDark.value ? 'Dark' : 'Light'))
const icon = computed(() => (isDark.value ? 'pi pi-moon' : 'pi pi-sun'))
</script>

<template>
  <button
    type="button"
    class="inline-flex w-full items-center justify-between rounded-lg border bg-[color:var(--admin-surface-0)] px-3 py-2 text-sm font-semibold text-[color:var(--admin-text)] transition [border-color:var(--admin-border)] hover:bg-[color:var(--admin-surface-1)]"
    @click="applyTheme(!isDark)"
  >
    <span class="inline-flex items-center gap-2">
      <i :class="icon" class="text-sm text-[color:var(--admin-text-muted)]" />
      <span>Theme</span>
    </span>
    <span class="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--admin-text-muted)]">{{ label }}</span>
  </button>
</template>
