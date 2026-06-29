<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Pre-computed heights (0..1 normalized). If omitted, a deterministic seed pattern is generated.
  peaks: { type: Array, default: null },
  // Number of bars (used when peaks is null)
  bars: { type: Number, default: 28 },
  // Visual size variants
  size: { type: String, default: 'sm' }, // 'xs' | 'sm' | 'md' | 'lg'
  // Visual mode
  variant: { type: String, default: 'solid' }, // 'solid' | 'translucent' | 'muted'
  // % of bars to mark as "played"
  progress: { type: Number, default: 0 },
  // Animate (equalizer) on hover
  animateOnHover: { type: Boolean, default: false },
  // Always animate
  animate: { type: Boolean, default: false }
})

const sizeMap = {
  xs: { h: 14, gap: 1 },
  sm: { h: 22, gap: 2 },
  md: { h: 36, gap: 2 },
  lg: { h: 56, gap: 2 }
}

const dim = computed(() => sizeMap[props.size] || sizeMap.sm)

const list = computed(() => {
  if (props.peaks && props.peaks.length) return props.peaks
  // Seed: deterministic gentle wave
  const n = props.bars
  return Array.from({ length: n }, (_, i) => {
    const a = Math.sin((i / n) * Math.PI * 2) * 0.4
    const b = Math.sin((i / n) * Math.PI * 6 + 1.2) * 0.25
    return 0.45 + a + b
  })
})

function heightPx(v) {
  const norm = Math.max(0.08, Math.min(1, v))
  return Math.round(norm * dim.value.h)
}
</script>

<template>
  <div
    :class="['wb', `wb-${size}`, `wb-${variant}`, { 'wb-hover': animateOnHover, 'wb-always': animate }]"
    :style="{ height: dim.h + 'px', gap: dim.gap + 'px' }"
    aria-hidden="true"
  >
    <span
      v-for="(v, i) in list"
      :key="i"
      :class="['wb-bar', { played: progress > 0 && (i / list.length) * 100 <= progress }]"
      :style="{ height: heightPx(v) + 'px', animationDelay: (i * 35) + 'ms' }"
    />
  </div>
</template>

<style scoped>
.wb {
  display: flex;
  align-items: flex-end;
  width: 100%;
}
.wb-bar {
  flex: 1;
  border-radius: 1.5px;
  min-height: 2px;
  transition: background .2s, height .2s;
}

/* Variants */
.wb-solid .wb-bar      { background: var(--c-teal-500); }
.wb-translucent .wb-bar{ background: rgba(255, 255, 255, 0.78); }
.wb-muted .wb-bar      { background: var(--c-border-strong); }

.wb-bar.played { background: var(--c-teal-500) !important; }

/* Animation modes */
.wb-always .wb-bar { animation: wb-eq 1.2s var(--ease-in-out) infinite; }
.wb-hover:hover .wb-bar { animation: wb-eq 1.2s var(--ease-in-out) infinite; }

@keyframes wb-eq {
  0%, 100% { transform: scaleY(0.75); transform-origin: bottom; }
  50%      { transform: scaleY(1.15);  transform-origin: bottom; }
}
</style>
