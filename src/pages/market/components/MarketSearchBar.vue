<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  'update:modelValue': [string]
  submit: [string]
}>()

const value = ref(props.modelValue || '')

watch(
  () => props.modelValue,
  (v) => {
    if (v !== value.value) value.value = v || ''
  }
)

function submit() {
  emit('submit', value.value)
}
</script>

<template>
  <form class="search" @submit.prevent="submit">
    <svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
    <input v-model="value" type="search" placeholder="Tìm tác phẩm, nghệ sĩ…" @input="emit('update:modelValue', value)" />
    <button class="btn btn-primary btn-sm" type="submit">Tìm</button>
  </form>
</template>

<style scoped>
.search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--c-surface);
  padding: 6px;
  border-radius: var(--radius-full);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-sm);
  min-width: 320px;
}
.ic { color: var(--c-text-mute); margin-left: 10px; flex-shrink: 0; }
input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  padding: 10px 8px;
  color: var(--c-text);
  font-family: inherit;
  min-width: 120px;
}
input::placeholder { color: var(--c-text-mute); }
@media (max-width: 640px) {
  .search { min-width: 0; width: 100%; }
}
</style>

