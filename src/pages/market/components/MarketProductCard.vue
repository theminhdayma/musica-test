<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { formatVND } from '../../../data/catalog'
import { getProductMarketPricing, getStableSeed, isProductNew, isProductTrending } from '../../../modules/catalog/marketPricing'
import type { ProductListItem } from '../../../modules/catalog/types'

const props = defineProps<{
  item: ProductListItem
}>()

const DEFAULT_MARKET_COVERS = Object.values(
  import.meta.glob('../../../assets/market-default/*.{png,jpg,jpeg,webp}', {
    eager: true,
    import: 'default'
  })
) as string[]

const badge = computed(() => {
  if (isProductNew(props.item.createdAt)) return { type: 'new', label: 'Mới' }
  return null
})

const isTrending = computed(() => isProductTrending(props.item))

const showFlame = computed(() => badge.value?.type === 'new' && isTrending.value)
const showTrendingBadge = computed(() => !badge.value && isTrending.value)

const pricing = computed(() => getProductMarketPricing(props.item))

const coverStyle = computed(() => {
  const fallbackUrl =
    DEFAULT_MARKET_COVERS.length > 0
      ? DEFAULT_MARKET_COVERS[getStableSeed(`${props.item.id}:${props.item.title}`) % DEFAULT_MARKET_COVERS.length]
      : null
  const url = props.item.thumbnailUrl || fallbackUrl
  if (!url) return { background: 'var(--grad-brand)' }
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})
</script>

<template>
  <RouterLink
    :to="`/product/${item.id}`"
    class="pcard"
    :class="[{ 'pcard--new': !!badge, 'pcard--hot': showTrendingBadge }]"
  >
    <div v-if="badge" class="pcard__badge pcard__badge--new">
      <span>{{ badge.label }}</span>
      <svg v-if="showFlame" class="pcard__badge-flame" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 2.1c.2 3-1.2 4.6-2.8 6.3-1.5 1.7-3.2 3.5-2.6 6.5.5 2.6 2.9 4.3 5.9 4.1 3-.2 5.2-2.4 5.5-5.4.2-2.4-.9-4.4-2.4-6.1-.6 1.6-1.8 2.8-3.4 3.3.3-1.8-.4-3.1-1.2-4.4-.9-1.5-1.9-3-1-5.3z"/>
      </svg>
    </div>
    <div v-else-if="showTrendingBadge" class="pcard__badge pcard__badge--hot">
      <svg class="pcard__badge-flame" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 2.1c.2 3-1.2 4.6-2.8 6.3-1.5 1.7-3.2 3.5-2.6 6.5.5 2.6 2.9 4.3 5.9 4.1 3-.2 5.2-2.4 5.5-5.4.2-2.4-.9-4.4-2.4-6.1-.6 1.6-1.8 2.8-3.4 3.3.3-1.8-.4-3.1-1.2-4.4-.9-1.5-1.9-3-1-5.3z"/>
      </svg>
      <span>Hot</span>
    </div>

    <!-- Cover / Thumbnail -->
    <div class="pcard__cover" :style="coverStyle">
      <!-- Play overlay -->
      <div class="pcard__play-overlay">
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
      <div class="pcard__summary">
        <div class="pcard__summary-main">
          <div class="pcard__title" :title="item.title">{{ item.title }}</div>
          <div class="pcard__artist">{{ item.artistDisplayName }}</div>
        </div>
        <div class="pcard__summary-side">
          <span v-if="item.genre" class="pcard__meta-item pcard__meta-item--key">{{ item.genre }}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="pcard__footer">
        <div class="pcard__price-wrap">
          <span class="pcard__price-caption">Giá</span>
          <div class="pcard__price-row">
            <span class="pcard__price pcard__price--sale">{{ formatVND(pricing.currentPrice) }}</span>
            <span class="pcard__price-original">{{ formatVND(pricing.originalPrice) }}</span>
            <span class="pcard__discount">-{{ pricing.discountPercent }}%</span>
          </div>
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
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: none;
  pointer-events: none;
}
.pcard__badge-flame {
  color: #ffd166;
  filter: drop-shadow(0 0 6px rgba(255, 145, 0, 0.55));
  transform-origin: center;
  animation: flameFlicker 0.9s infinite;
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

@keyframes flameFlicker {
  0%, 100% { transform: rotate(-8deg) scale(1); opacity: 0.95; }
  50% { transform: rotate(10deg) scale(1.08); opacity: 1; }
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

.pcard__summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 10px;
}

.pcard__summary-main {
  min-width: 0;
}

.pcard__summary-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  min-width: fit-content;
}

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

/* ===== Footer / Price ===== */
.pcard__footer {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--c-border);
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 8px;
  margin-top: 10px;
}
.pcard__price-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  padding-top: 10px;
}
.pcard__price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: nowrap;
}
.pcard__price-caption {
  font-size: 11px;
  color: var(--c-text-mute);
}
.pcard__price-original {
  font-size: 12px;
  color: var(--c-text-mute);
  text-decoration: line-through;
  white-space: nowrap;
}
.pcard__price {
  font-size: 17.5px;
  font-weight: 800;
  color: var(--c-blue-600);
  letter-spacing: -0.01em;
  white-space: nowrap;
}
.pcard__price--sale { color: var(--c-blue-600); }
.pcard__discount {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #fb7185, #f97316, #facc15);
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
  position: absolute;
  top: -6px;
  right: -26px;
  z-index: 2;
  transform: translateY(-50%);
  box-shadow: 0 10px 26px rgba(249, 115, 22, 0.28);
  animation: discountBlink 1.1s ease-in-out infinite;
  border: 2px solid rgba(255, 255, 255, 0.95);
}

@keyframes discountBlink {
  0%, 100% {
    transform: translateY(-50%) scale(1);
    filter: saturate(1.05) brightness(1.02);
    box-shadow: 0 10px 26px rgba(249, 115, 22, 0.28);
  }
  50% {
    transform: translateY(calc(-50% - 1px)) scale(1.05);
    filter: saturate(1.35) brightness(1.18);
    box-shadow: 0 16px 38px rgba(249, 115, 22, 0.52);
  }
}
</style>
