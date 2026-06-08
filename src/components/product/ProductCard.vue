<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { formatVND } from '../../data/catalog'
import WaveBars from '../ui/WaveBars.vue'

const props = defineProps({
  product: { type: Object, required: true }
})

const fromPrice = computed(() => formatVND(props.product.basePrice))
// Normalize sample peaks (0..60) to 0..1 for WaveBars
const peaks = computed(() => (props.product.samplePeak || []).slice(0, 22).map(v => v / 60))
</script>

<template>
  <RouterLink :to="`/product/${product.id}`" class="card product-card">
    <div class="cover" :style="{ background: product.cover }">
      <div class="cover-overlay"></div>
      <div class="cover-meta">
        <span class="badge-cat">{{ product.category.toUpperCase() }}</span>
        <span class="rating">★ {{ product.rating }}</span>
      </div>
      <div class="cover-bottom">
        <WaveBars :peaks="peaks" size="xs" variant="translucent" :animate-on-hover="true" class="wave" />
        <button class="play-fab" aria-label="Nghe thử">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </button>
      </div>
    </div>
    <div class="body">
      <div class="row-top">
        <h3 :title="product.title">{{ product.title }}</h3>
        <span class="duration">{{ product.duration }}</span>
      </div>
      <div class="artist">
        <span class="ava" :style="{ background: product.cover }"></span>
        {{ product.artist }}
      </div>
      <div class="row-bot">
        <div class="price">
          <span class="from">Từ</span>
          <strong>{{ fromPrice }}</strong>
        </div>
        <span class="cta">Mua tác quyền →</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.product-card {
  display: block;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  background: #fff;
}
.cover {
  position: relative;
  aspect-ratio: 16 / 9;
  display: block;
  overflow: hidden;
}
.cover-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.32));
}
.cover-meta {
  position: absolute; top: 10px; left: 10px; right: 10px;
  display: flex; justify-content: space-between; align-items: center;
}
.badge-cat {
  background: rgba(255,255,255,0.92);
  color: var(--c-blue-700);
  padding: 3px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  backdrop-filter: blur(8px);
}
.rating {
  background: rgba(12,30,51,0.55);
  color: #fff;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
  backdrop-filter: blur(8px);
}
.cover-bottom {
  position: absolute;
  left: 12px; right: 12px; bottom: 10px;
  display: flex; align-items: flex-end; gap: 10px;
}
.wave { flex: 1; opacity: 0.95; }
.play-fab {
  flex-shrink: 0;
  width: 26px; height: 26px;
  border-radius: 50%;
  background: #fff;
  color: var(--c-blue-700);
  border: none;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-sm);
  transform: scale(0.85);
  opacity: 0;
  transition: opacity .25s var(--ease-out), transform .25s var(--ease-out);
}
.card:hover .play-fab { opacity: 1; transform: scale(1); }

.body { padding: 12px 14px 14px; }
.row-top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.row-top h3 {
  margin: 0;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.005em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  min-width: 0;
}
.duration { font-size: 11.5px; color: var(--c-text-mute); font-variant-numeric: tabular-nums; flex-shrink: 0; }
.artist {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 3px;
  color: var(--c-text-soft);
  font-size: 12.5px;
  font-weight: 500;
}
.ava {
  width: 14px; height: 14px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid var(--c-border);
}
.row-bot {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--c-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.price .from { color: var(--c-text-mute); font-size: 10.5px; margin-right: 4px; text-transform: uppercase; letter-spacing: 0.08em; }
.price strong { color: var(--c-blue-700); font-size: 14px; font-weight: 800; font-variant-numeric: tabular-nums; }
.cta { font-size: 12px; font-weight: 600; color: var(--c-teal-600); transition: transform .25s var(--ease-out); white-space: nowrap; }
.card:hover .cta { transform: translateX(3px); }
</style>
