<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  content: string
  placement?: string
}>()

const tooltipOpts = computed(() => ({
  content: props.content,
  theme: 'artist-hint',
  placement: props.placement ?? 'right',
}))
</script>

<template>
  <span
    v-tooltip="tooltipOpts"
    class="hint-icon"
    tabindex="0"
    role="button"
    :aria-label="content"
  >
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
  </span>
</template>

<style scoped>
.hint-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: var(--c-text-mute);
  opacity: 0.38;
  cursor: help;
  flex-shrink: 0;
  transition: opacity .2s, color .2s, background .2s;
  outline: none;
}
.hint-icon:hover,
.hint-icon:focus-visible {
  opacity: 1;
  color: var(--c-blue-600);
  background: var(--c-blue-50);
}
</style>
