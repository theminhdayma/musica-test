<script setup>
defineProps({
  items: { type: Array, required: true } // [{ label, hint? }]
})
</script>

<template>
  <ul class="checklist">
    <li v-for="(it, i) in items" :key="i">
      <span class="tick" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 10 18 20 6" /></svg>
      </span>
      <div class="body">
        <strong>{{ typeof it === 'string' ? it : it.label }}</strong>
        <span v-if="typeof it !== 'string' && it.hint">{{ it.hint }}</span>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.checklist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 18px;
}
.checklist li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
}
.tick {
  width: 22px; height: 22px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--c-teal-50);
  color: var(--c-teal-600);
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid rgba(20,184,166,0.25);
}
.body strong { display: block; font-size: 13.5px; font-weight: 600; }
.body span { display: block; font-size: 12px; color: var(--c-text-mute); margin-top: 1px; }

@media (max-width: 560px) { .checklist { grid-template-columns: 1fr; } }
</style>
