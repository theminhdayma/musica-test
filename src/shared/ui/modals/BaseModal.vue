<script setup>
import { onBeforeUnmount, onMounted, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  closeOnBackdrop: { type: Boolean, default: true }
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}

function onKeydown(e) {
  if (!props.open) return
  if (e.key === 'Escape') close()
}

watch(() => props.open, (value) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = value ? 'hidden' : ''
}, { immediate: true })

onMounted(() => {
  if (typeof window === 'undefined') return
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('keydown', onKeydown)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="overlay" @click="closeOnBackdrop ? close() : null">
      <div class="dialog" role="dialog" aria-modal="true" @click.stop>
        <div class="head">
          <div class="title">{{ title }}</div>
          <button class="x" type="button" aria-label="Đóng" @click="close">✕</button>
        </div>
        <div class="body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="foot">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.55);
  display: grid;
  place-items: center;
  padding: 22px;
  z-index: 60;
}

.dialog {
  width: min(640px, calc(100vw - 24px));
  max-height: min(82vh, 720px);
  overflow: hidden;
  background: #fff;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 60px rgba(2, 6, 23, 0.55);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--c-border);
  background: linear-gradient(180deg, #fff, #f7fbff);
}

.title {
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--c-text);
}

.x {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid var(--c-border);
  background: #fff;
  color: var(--c-text-soft);
}

.x:hover {
  background: var(--c-bg-soft);
  color: var(--c-text);
}

.body {
  padding: 16px 18px;
  overflow: auto;
  max-height: calc(82vh - 130px);
}

.foot {
  padding: 14px 18px;
  border-top: 1px solid var(--c-border);
  background: linear-gradient(180deg, #fff, #f7fbff);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

