<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const currentQ = computed(() => {
  if (route.name === 'search') return typeof route.params.q === 'string' ? route.params.q : ''
  if (route.name === 'market') return typeof route.query.q === 'string' ? route.query.q : ''
  return ''
})

const value = ref(currentQ.value)

watch(
  () => currentQ.value,
  (v) => {
    if (v !== value.value) value.value = v
  }
)

function submit() {
  const q = value.value.trim()
  if (!q) return
  router.push({ name: 'search', params: { q } })
}
</script>

<template>
  <form class="search" @submit.prevent="submit">
    <svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
    <input v-model="value" type="search" placeholder="Tìm tác phẩm, nghệ sĩ…" />
  </form>
</template>

<style scoped>
.search {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  background: var(--c-bg-mute);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-sm);
  min-width: 360px;
}
.ic { color: var(--c-text-mute); flex-shrink: 0; }
input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  padding: 0;
  color: var(--c-text);
  font-family: inherit;
  min-width: 120px;
}
input::placeholder { color: var(--c-text-mute); }
@media (max-width: 960px) {
  .search { min-width: 0; width: 100%; }
}
</style>
