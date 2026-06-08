<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { ProductListItem } from '../../../modules/catalog/types'

const props = defineProps<{
  item: ProductListItem
  rawProduct?: any
}>()

// Derive card badge state from raw product data
const badge = computed(() => {
  if (!props.rawProduct) return null
  const listens = props.rawProduct.listens || 0
  const releaseDate = props.rawProduct.releaseDate ? new Date(props.rawProduct.releaseDate) : null
  const now = new Date()
  const diffDays = releaseDate ? (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24) : 999

  if (listens > 400000) return { type: 'hot', label: 'HOT' }
  if (diffDays < 90) return { type: 'new', label: 'MỚI' }
  if (listens > 200000) return { type: 'trend', label: 'TRENDING' }
  return null
})

const hasDiscount = computed(() => {
  if (!props.rawProduct) return false
  // Products with lofi category have a simulated 20% discount
  return props.rawProduct.category === 'lofi'
})

const discountPercent = 20

const price = computed(() => {
  if (!props.rawProduct) return null
  return props.rawProduct.basePrice || null
})

const originalPrice = computed(() => {
  if (!hasDiscount.value || !price.value) return null
  return Math.round(price.value / (1 - discountPercent / 100))
})

const formattedPrice = (val: number) =>
  new Intl.NumberFormat('vi-VN').format(val) + ' ₫'

const bpm = computed(() => props.rawProduct?.bpm || null)
const duration = computed(() => props.rawProduct?.duration || null)
const key = computed(() => props.rawProduct?.key || null)
const rating = computed(() => props.rawProduct?.rating || null)
const listens = computed(() => {
  const n = props.rawProduct?.listens || 0
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return Math.round(n / 1000) + 'K'
  return String(n)
})
const samplePeak = computed(() => props.rawProduct?.samplePeak || [])
const coverStyle = computed(() => {
  const url = props.item.thumbnailUrl
  if (!url) return { background: 'var(--grad-brand)' }
  if (url.startsWith('linear-gradient') || url.startsWith('radial-gradient')) {
    return { background: url }
  }
  return { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
})
</script>

<template>
  <RouterLink :to="`/product/${item.id}`" class="pcard" :class="[badge ? `pcard--${badge.type}` : '', hasDiscount ? 'pcard--sale' : '']">
    <!-- Badge -->
    <div v-if="badge" class="pcard__badge" :class="`pcard__badge--${badge.type}`">{{ badge.label }}</div>
    <div v-else-if="hasDiscount" class="pcard__badge pcard__badge--sale">-{{ discountPercent }}%</div>

    <!-- Cover / Thumbnail -->
    <div class="pcard__cover" :style="coverStyle">
      <!-- Waveform overlay -->
      <div v-if="samplePeak.length" class="pcard__wave">
        <span
          v-for="(h, i) in samplePeak.slice(0, 28)"
          :key="i"
          class="pcard__wave-bar"
          :style="{ height: `${Math.min(100, (h / 60) * 100)}%` }"
        />
      </div>
      <!-- Play overlay -->
      <div class="pcard__play-overlay">
        <div class="pcard__play-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div class="pcard__quick-actions">
          <button class="pcard__qa-btn" @click.prevent>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Giỏ hàng
          </button>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="pcard__body">
      <!-- Title + Artist -->
      <div class="pcard__title" :title="item.title">{{ item.title }}</div>
      <div class="pcard__artist">{{ item.artistDisplayName }}</div>

      <!-- Meta row: BPM, Duration, Key -->
      <div class="pcard__meta">
        <span v-if="duration" class="pcard__meta-item">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {{ duration }}
        </span>
        <span v-if="bpm" class="pcard__meta-item">{{ bpm }} BPM</span>
        <span v-if="key" class="pcard__meta-item pcard__meta-item--key">{{ key }}</span>
      </div>

      <!-- Rating + Listens -->
      <div class="pcard__stats">
        <span v-if="rating" class="pcard__rating">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          {{ rating }}
        </span>
        <span v-if="listens" class="pcard__listens">{{ listens }} lượt nghe</span>
      </div>

      <!-- Price footer -->
      <div class="pcard__footer">
        <div class="pcard__price-wrap">
          <span v-if="originalPrice" class="pcard__price-original">{{ formattedPrice(originalPrice) }}</span>
          <span v-if="price" class="pcard__price" :class="{ 'pcard__price--sale': hasDiscount }">
            {{ formattedPrice(price) }}
          </span>
        </div>
        <div class="pcard__cta">
          Cấp phép
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
/* ===== Card Base ===== */
.pcard {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  transition: box-shadow .3s var(--ease-out), border-color .3s, transform .3s var(--ease-out);
  cursor: pointer;
}
.pcard:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--c-blue-300);
  transform: translateY(-3px);
}
.pcard--hot { border-color: rgba(239, 68, 68, 0.35); }
.pcard--new { border-color: rgba(20, 184, 166, 0.35); }
.pcard--trend { border-color: rgba(139, 92, 246, 0.35); }
.pcard--sale { border-color: rgba(249, 115, 22, 0.35); }

/* ===== Badge ===== */
.pcard__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  padding: 3px 9px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  pointer-events: none;
}
.pcard__badge--hot {
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: #fff;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.45);
}
.pcard__badge--new {
  background: linear-gradient(135deg, #14b8a6, #2aa7d8);
  color: #fff;
  box-shadow: 0 2px 8px rgba(20, 184, 166, 0.45);
}
.pcard__badge--trend {
  background: linear-gradient(135deg, #8b5cf6, #6d3bd7);
  color: #fff;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.45);
}
.pcard__badge--sale {
  background: linear-gradient(135deg, #f97316, #ef4444);
  color: #fff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.45);
}

/* ===== Cover ===== */
.pcard__cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  flex-shrink: 0;
}

/* ===== Waveform ===== */
.pcard__wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  display: flex;
  align-items: flex-end;
  gap: 1.5px;
  padding: 0 8px;
  background: linear-gradient(to top, rgba(0,0,0,0.55), transparent);
  pointer-events: none;
}
.pcard__wave-bar {
  display: block;
  flex: 1;
  min-width: 2px;
  border-radius: 2px 2px 0 0;
  background: rgba(255, 255, 255, 0.5);
  transition: height .3s var(--ease-out);
}
.pcard:hover .pcard__wave-bar {
  background: rgba(95, 217, 193, 0.8);
}

/* ===== Play Overlay ===== */
.pcard__play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(12, 30, 51, 0.5);
  opacity: 0;
  transition: opacity .3s var(--ease-out);
  backdrop-filter: blur(3px);
}
.pcard:hover .pcard__play-overlay { opacity: 1; }

.pcard__play-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--grad-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: var(--shadow-glow);
  transform: scale(0.85);
  transition: transform .25s var(--ease-out);
}
.pcard:hover .pcard__play-btn { transform: scale(1); }

.pcard__quick-actions {
  display: flex;
  gap: 8px;
}
.pcard__qa-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-full);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background .2s;
  backdrop-filter: blur(4px);
}
.pcard__qa-btn:hover { background: rgba(255, 255, 255, 0.25); }

/* ===== Body ===== */
.pcard__body { padding: 12px 14px 14px; display: flex; flex-direction: column; flex: 1; }

.pcard__title {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.pcard__artist {
  font-size: 12.5px;
  color: var(--c-text-soft);
  font-weight: 600;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pcard__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.pcard__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  background: var(--c-bg-mute);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  color: var(--c-text-mute);
}
.pcard__meta-item--key {
  background: var(--c-teal-50);
  color: var(--c-teal-600);
}

.pcard__stats {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 7px;
}
.pcard__rating {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 700;
  color: #92400e;
}
.pcard__listens {
  font-size: 11.5px;
  color: var(--c-text-mute);
  font-weight: 500;
}

/* ===== Footer / Price ===== */
.pcard__footer {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--c-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}
.pcard__price-wrap { display: flex; flex-direction: column; }
.pcard__price-original {
  font-size: 11px;
  color: var(--c-text-mute);
  text-decoration: line-through;
}
.pcard__price {
  font-size: 14.5px;
  font-weight: 800;
  color: var(--c-blue-600);
  letter-spacing: -0.01em;
}
.pcard__price--sale { color: #ea580c; }

.pcard__cta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 13px;
  background: var(--grad-brand);
  color: #fff;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.25);
  transition: box-shadow .25s, transform .25s var(--ease-out);
}
.pcard:hover .pcard__cta {
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
  transform: translateX(1px);
}
</style>
