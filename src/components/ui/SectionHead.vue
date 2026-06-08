<script setup>
defineProps({
  eyebrow: String,
  title: String,
  description: String,
  align: { type: String, default: 'left' } // 'left' | 'center'
})
</script>

<template>
  <div :class="['section-head', { center: align === 'center' }]">
    <div class="text">
      <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
      <h2 v-if="title">{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="actions"><slot name="actions" /></div>
  </div>
</template>

<style scoped>
.section-head {
  display: flex; justify-content: space-between; align-items: end;
  margin-bottom: 30px; gap: 24px;
}
.section-head.center { flex-direction: column; align-items: center; text-align: center; margin-bottom: 44px; }
.section-head h2 {
  margin: 12px 0 6px;
  font-size: clamp(22px, 2.8vw, 32px);
  letter-spacing: -0.02em;
  font-weight: 800;
}
.section-head p { color: var(--c-text-soft); margin: 0; max-width: 560px; font-size: 14.5px; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
@media (max-width: 640px) {
  .section-head { flex-direction: column; align-items: flex-start; }
  .actions { width: 100%; }
  .actions .btn { flex: 1; }
}
</style>
