<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { ProductListItem } from '../../modules/catalog/types'

const props = defineProps<{ product: ProductListItem }>()

const COVER_GRADIENTS = [
  'linear-gradient(135deg,#1f6df0 0%,#14b8a6 100%)',
  'linear-gradient(135deg,#2aa7d8 0%,#5fd9c1 100%)',
  'linear-gradient(135deg,#0e3fa0 0%,#1f6df0 60%,#14b8a6 100%)',
  'linear-gradient(135deg,#5fd9c1 0%,#2aa7d8 100%)',
  'linear-gradient(135deg,#0c1e33 0%,#1f6df0 50%,#14b8a6 100%)',
  'linear-gradient(160deg,#1456cf 0%,#2aa7d8 50%,#5fd9c1 100%)',
  'linear-gradient(135deg,#7c3aed 0%,#1f6df0 100%)',
  'linear-gradient(135deg,#0f766e 0%,#2aa7d8 100%)',
]

const coverBg = computed(() => {
  if (props.product.thumbnailUrl) return undefined
  const idx = Math.abs(props.product.id.charCodeAt(0) + (props.product.id.charCodeAt(1) ?? 0)) % COVER_GRADIENTS.length
  return COVER_GRADIENTS[idx]
})

const genreLabel = computed(() => props.product.genres?.[0] ?? props.product.genre ?? 'Nhạc')

const duration = computed(() => {
  const s = props.product.durationSeconds
  if (!s) return null
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
})

const priceLabel = computed(() => {
  const p = props.product.basePrice
  if (!p) return null
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(p)
})
</script>

<template>
  <RouterLink :to="`/product/${product.id}`" class="hot-card">
    <!-- Thumbnail -->
    <div
      class="hot-cover"
      :style="product.thumbnailUrl
        ? { backgroundImage: `url(${product.thumbnailUrl})` }
        : { background: coverBg }"
    >
      <div class="hot-cover-overlay" />
      <div class="hot-cover-top">
        <span class="hot-genre">{{ genreLabel }}</span>
      </div>
      <button class="hot-play" aria-label="Nghe thử" @click.prevent>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>

    <!-- Info -->
    <div class="hot-body">
      <h3 class="hot-title" :title="product.title">{{ product.title }}</h3>
      <div class="hot-artist">
        <span class="hot-ava" :style="{ background: coverBg ?? 'var(--grad-brand)' }" />
        {{ product.artistDisplayName }}
      </div>
      <div class="hot-footer">
        <span v-if="priceLabel" class="hot-price">{{ priceLabel }}</span>
        <span v-else class="hot-price hot-price--free">Liên hệ</span>
        <span v-if="duration" class="hot-dur">{{ duration }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.hot-card {
  display: flex;
  flex-direction: column;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  position: relative;
  transition: transform .25s var(--ease-out), box-shadow .25s var(--ease-out), border-color .25s;
}
.hot-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
  border-color: var(--c-border-strong);
}

.hot-cover {
  position: relative;
  aspect-ratio: 16/9;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}
.hot-cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,.1) 0%, rgba(0,0,0,.45) 100%);
}
.hot-cover-top {
  position: absolute;
  top: 10px;
  right: 10px;
}
.hot-genre {
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  background: rgba(255,255,255,.18);
  color: #fff;
  backdrop-filter: blur(4px);
}
.hot-play {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,.92);
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--c-blue-700);
  box-shadow: var(--shadow-sm);
  transition: transform .2s, background .2s;
  opacity: 0;
}
.hot-card:hover .hot-play {
  opacity: 1;
  transform: scale(1.1);
}

.hot-body {
  padding: 14px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.hot-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hot-artist {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  color: var(--c-text-soft);
  font-weight: 500;
}
.hot-ava {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}
.hot-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}
.hot-price {
  font-size: 13px;
  font-weight: 700;
  color: var(--c-blue-700);
}
.hot-price--free {
  color: var(--c-teal-600);
}
.hot-dur {
  font-size: 11.5px;
  color: var(--c-text-mute);
  font-variant-numeric: tabular-nums;
}
</style>
