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

const durationLabel = computed(() => {
  const s = props.item.durationSeconds
  if (!s) return null
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
})

const primaryGenre = computed(() => {
  if (props.item.genres && props.item.genres.length > 0) return props.item.genres[0]
  return props.item.genre || null
})

const secondaryGenres = computed(() => {
  const all = props.item.genres && props.item.genres.length > 0 ? props.item.genres : props.item.genre ? [props.item.genre] : []
  return all.slice(1, 3)
})

const topUseCases = computed(() => (props.item.useCases || []).slice(0, 2))

const seed = computed(() => getStableSeed(`${props.item.id}:${props.item.title}`))

const ratingValue = computed(() => {
  const r = 3.8 + (seed.value % 13) * 0.1
  return Math.min(5, Math.round(r * 10) / 10)
})

const reviewCount = computed(() => 12 + (seed.value % 89))

const playsCount = computed(() => {
  const base = 200 + (seed.value % 4800)
  return base >= 1000 ? `${(base / 1000).toFixed(1)}k` : String(base)
})

const accentGradient = computed(() => {
  const gradients = [
    'linear-gradient(135deg, #1f6df0 0%, #2aa7d8 55%, #14b8a6 100%)',
    'linear-gradient(135deg, #6366f1 0%, #2aa7d8 55%, #14b8a6 100%)',
    'linear-gradient(135deg, #0e3fa0 0%, #1f6df0 60%, #14b8a6 100%)',
    'linear-gradient(135deg, #1f6df0 0%, #6366f1 100%)',
    'linear-gradient(135deg, #14b8a6 0%, #2aa7d8 55%, #1f6df0 100%)',
  ]
  return gradients[seed.value % gradients.length]
})
</script>

<template>
  <RouterLink
    :to="`/product/${item.id}`"
    class="pcard"
    :class="[{ 'pcard--new': !!badge, 'pcard--hot': showTrendingBadge }]"
  >
    <!-- Badges -->
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

    <!-- Sheet music badge -->
    <div v-if="item.hasSheetMusic" class="pcard__sheet-badge">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3v10.55A4 4 0 1 0 11 17V7h4V3H9z"/></svg>
      Bản nhạc
    </div>

    <!-- Cover / Thumbnail -->
    <div class="pcard__cover" :style="coverStyle">
      <!-- Accent line at top -->
      <div class="pcard__accent-line" :style="{ background: accentGradient }" />

      <!-- Waveform bars -->
      <div class="pcard__wave">
        <span
          v-for="i in 20"
          :key="i"
          class="pcard__wave-bar"
          :style="{ height: (25 + ((seed + i * 7) % 70)) + '%' }"
        />
      </div>

      <!-- Play overlay -->
      <div class="pcard__play-overlay">
        <div class="pcard__play-btn" :style="{ background: accentGradient }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div class="pcard__quick-actions">
          <button class="pcard__qa-btn" @click.prevent>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Giỏ hàng
          </button>
          <button class="pcard__qa-btn pcard__qa-btn--icon" @click.prevent>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
      </div>

      <!-- Duration chip -->
      <div v-if="durationLabel" class="pcard__duration">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>
        {{ durationLabel }}
      </div>
    </div>

    <!-- Body -->
    <div class="pcard__body">
      <!-- Artist row -->
      <div class="pcard__artist-row">
        <div class="pcard__artist-avatar" :style="{ background: accentGradient }">
          {{ item.artistDisplayName.charAt(0).toUpperCase() }}
        </div>
        <span class="pcard__artist-name">{{ item.artistDisplayName }}</span>
      </div>

      <!-- Title -->
      <div class="pcard__title" :title="item.title">{{ item.title }}</div>

      <!-- Genre tags -->
      <div v-if="primaryGenre" class="pcard__genres">
        <span class="pcard__genre-tag pcard__genre-tag--primary">{{ primaryGenre }}</span>
        <span v-for="g in secondaryGenres" :key="g" class="pcard__genre-tag">{{ g }}</span>
      </div>

      <!-- Use-cases -->
      <div v-if="topUseCases.length" class="pcard__usecases">
        <span v-for="uc in topUseCases" :key="uc" class="pcard__usecase-tag">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {{ uc }}
        </span>
      </div>

      <!-- Stats row -->
      <div class="pcard__stats">
        <span class="pcard__stat">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#facc15"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          {{ ratingValue }}
          <span class="pcard__stat-mute">({{ reviewCount }})</span>
        </span>
        <span class="pcard__stat-sep">·</span>
        <span class="pcard__stat">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          {{ playsCount }} lượt nghe
        </span>
      </div>

      <!-- Divider -->
      <div class="pcard__divider" />

      <!-- Footer / Price -->
      <div class="pcard__footer">
        <div class="pcard__price-block">
          <span class="pcard__price-sale">{{ formatVND(pricing.currentPrice) }}</span>
          <span class="pcard__price-original">{{ formatVND(pricing.originalPrice) }}</span>
        </div>
        <span class="pcard__discount-badge">-{{ pricing.discountPercent }}%</span>
      </div>
    </div>

    <!-- Bottom glow line (shows on hover) -->
    <div class="pcard__glow-line" :style="{ background: accentGradient }" />
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
  border-radius: var(--radius-lg);
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  transition: box-shadow .3s var(--ease-out), border-color .3s, transform .3s var(--ease-out);
  cursor: pointer;
}
.pcard:hover {
  box-shadow: 0 12px 40px rgba(31, 109, 240, 0.16), 0 4px 16px rgba(20, 184, 166, 0.12);
  border-color: var(--c-blue-200);
  transform: translateY(-4px);
}
.pcard--hot { border-color: rgba(239, 68, 68, 0.3); }
.pcard--new { border-color: rgba(20, 184, 166, 0.3); }

/* ===== Top accent line ===== */
.pcard__accent-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 3;
}

/* ===== Bottom glow line (shows on hover) ===== */
.pcard__glow-line {
  height: 3px;
  opacity: 0;
  transition: opacity .3s var(--ease-out);
  flex-shrink: 0;
}
.pcard:hover .pcard__glow-line { opacity: 1; }

/* ===== Badges ===== */
.pcard__badge {
  position: absolute;
  top: 14px;
  left: 12px;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
  pointer-events: none;
}
.pcard__badge-flame {
  color: #ffd166;
  filter: drop-shadow(0 0 4px rgba(255, 145, 0, 0.6));
  animation: flameFlicker 0.9s infinite;
}
.pcard__badge--hot {
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: #fff;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}
.pcard__badge--new {
  background: linear-gradient(135deg, #14b8a6, #2aa7d8);
  color: #fff;
  box-shadow: 0 2px 8px rgba(20, 184, 166, 0.4);
}
.pcard__sheet-badge {
  position: absolute;
  top: 14px;
  right: 12px;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 700;
  background: rgba(255,255,255,0.92);
  color: var(--c-blue-700);
  border: 1px solid var(--c-blue-100);
  backdrop-filter: blur(6px);
  pointer-events: none;
}

@keyframes flameFlicker {
  0%, 100% { transform: rotate(-8deg) scale(1); opacity: 0.95; }
  50% { transform: rotate(10deg) scale(1.08); opacity: 1; }
}

/* ===== Cover ===== */
.pcard__cover {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  flex-shrink: 0;
}

/* ===== Waveform ===== */
.pcard__wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  padding: 0 10px 6px;
  background: linear-gradient(to top, rgba(12,30,51,0.7), transparent);
  pointer-events: none;
}
.pcard__wave-bar {
  display: block;
  flex: 1;
  min-width: 2px;
  border-radius: 2px 2px 0 0;
  background: rgba(255, 255, 255, 0.35);
  transition: background .3s var(--ease-out);
}
.pcard:hover .pcard__wave-bar { background: rgba(95, 217, 193, 0.7); }

/* ===== Duration chip ===== */
.pcard__duration {
  position: absolute;
  bottom: 8px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(12, 30, 51, 0.72);
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.92);
  backdrop-filter: blur(4px);
  pointer-events: none;
}

/* ===== Play Overlay ===== */
.pcard__play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(12, 30, 51, 0.45);
  opacity: 0;
  transition: opacity .3s var(--ease-out);
  backdrop-filter: blur(3px);
}
.pcard:hover .pcard__play-overlay { opacity: 1; }

.pcard__play-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 4px 20px rgba(0,0,0,0.35);
  transform: scale(0.88);
  transition: transform .25s var(--ease-out);
}
.pcard:hover .pcard__play-btn { transform: scale(1); }

.pcard__quick-actions { display: flex; gap: 8px; }
.pcard__qa-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-full);
  color: #fff;
  font-size: 11.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background .2s;
  backdrop-filter: blur(4px);
}
.pcard__qa-btn--icon { padding: 6px 8px; }
.pcard__qa-btn:hover { background: rgba(255, 255, 255, 0.28); }

/* ===== Body ===== */
.pcard__body {
  padding: 13px 14px 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 7px;
}

/* ===== Artist row ===== */
.pcard__artist-row {
  display: flex;
  align-items: center;
  gap: 7px;
}
.pcard__artist-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}
.pcard__artist-name {
  font-size: 12px;
  color: var(--c-text-mute);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== Title ===== */
.pcard__title {
  font-size: 14.5px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

/* ===== Genre tags ===== */
.pcard__genres {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.pcard__genre-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 10.5px;
  font-weight: 700;
  background: var(--c-bg-mute);
  color: var(--c-text-mute);
}
.pcard__genre-tag--primary {
  background: var(--c-blue-50);
  color: var(--c-blue-700);
  border: 1px solid var(--c-blue-100);
}

/* ===== Use-cases ===== */
.pcard__usecases {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.pcard__usecase-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
  background: var(--c-teal-50);
  color: var(--c-teal-600);
  border: 1px solid rgba(20, 184, 166, 0.2);
}

/* ===== Stats row ===== */
.pcard__stats {
  display: flex;
  align-items: center;
  gap: 6px;
}
.pcard__stat {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  color: var(--c-text-soft);
}
.pcard__stat-mute {
  color: var(--c-text-mute);
  font-weight: 500;
}
.pcard__stat-sep {
  font-size: 11px;
  color: var(--c-text-mute);
}

/* ===== Divider ===== */
.pcard__divider {
  height: 1px;
  background: var(--c-border);
}

/* ===== Footer / Price ===== */
.pcard__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
}
.pcard__price-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.pcard__price-sale {
  font-size: 17px;
  font-weight: 900;
  color: var(--c-blue-600);
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.pcard__price-original {
  font-size: 11.5px;
  color: var(--c-text-mute);
  text-decoration: line-through;
  font-weight: 500;
}
.pcard__discount-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #fb7185, #f97316);
  color: #fff;
  font-size: 11.5px;
  font-weight: 900;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  animation: discountPulse 2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes discountPulse {
  0%, 100% { box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); transform: scale(1); }
  50% { box-shadow: 0 6px 20px rgba(249, 115, 22, 0.5); transform: scale(1.04); }
}
</style>
