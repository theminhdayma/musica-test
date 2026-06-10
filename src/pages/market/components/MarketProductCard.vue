<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { formatVND } from '../../../data/catalog'
import type { ProductListItem } from '../../../modules/catalog/types'

const props = defineProps<{
  item: ProductListItem
}>()

const badge = computed(() => {
  const createdAt = props.item.createdAt ? new Date(props.item.createdAt) : null
  if (!createdAt || Number.isNaN(createdAt.getTime())) return null
  const diffDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays <= 45) return { type: 'new', label: 'MỚI' }
  return null
})

const durationLabel = computed(() => {
  if (!props.item.durationSeconds || props.item.durationSeconds <= 0) return null
  const minutes = Math.floor(props.item.durationSeconds / 60)
  const seconds = props.item.durationSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

const useCaseLabel = computed(() => {
  const [first] = props.item.useCases
  if (!first) return null

  const labels: Record<string, string> = {
    ADVERTISEMENT: 'Quảng cáo',
    VLOG: 'Vlog',
    SOCIAL: 'Mạng xã hội',
    FILM: 'Phim',
    GAME: 'Game',
    PODCAST: 'Podcast',
    EVENT: 'Sự kiện'
  }

  return labels[first] || first
})

const updatedLabel = computed(() => {
  const updatedAt = props.item.updatedAt ? new Date(props.item.updatedAt) : null
  if (!updatedAt || Number.isNaN(updatedAt.getTime())) return null
  return updatedAt.toLocaleDateString('vi-VN')
})

const coverStyle = computed(() => {
  const url = props.item.thumbnailUrl
  if (!url) return { background: 'var(--grad-brand)' }
  return { backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
})
</script>

<template>
  <RouterLink :to="`/product/${item.id}`" class="pcard" :class="[badge ? `pcard--${badge.type}` : '']">
    <!-- Badge -->
    <div v-if="badge" class="pcard__badge" :class="`pcard__badge--${badge.type}`">{{ badge.label }}</div>

    <!-- Cover / Thumbnail -->
    <div class="pcard__cover" :style="coverStyle">
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

      <!-- Meta row -->
      <div class="pcard__meta">
        <span v-if="durationLabel" class="pcard__meta-item">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {{ durationLabel }}
        </span>
        <span v-if="item.genre" class="pcard__meta-item pcard__meta-item--key">{{ item.genre }}</span>
        <span v-if="useCaseLabel" class="pcard__meta-item">{{ useCaseLabel }}</span>
      </div>

      <!-- Update + Use cases -->
      <div class="pcard__stats">
        <span v-if="updatedLabel" class="pcard__listens">Cập nhật {{ updatedLabel }}</span>
        <span v-if="item.useCases.length > 1" class="pcard__listens">{{ item.useCases.length }} mục đích sử dụng</span>
      </div>

      <!-- Footer -->
      <div class="pcard__footer">
        <div class="pcard__price-wrap">
          <span class="pcard__price-caption">Giá từ</span>
          <span class="pcard__price">{{ typeof item.basePrice === 'number' ? formatVND(item.basePrice) : 'Liên hệ' }}</span>
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
.pcard__price-caption {
  font-size: 11px;
  color: var(--c-text-mute);
}
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
