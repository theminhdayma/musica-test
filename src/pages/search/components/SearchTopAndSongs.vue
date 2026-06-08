<script setup lang="ts">
import type { ProductListItem } from '../../../modules/catalog/types'

defineEmits<{ goTracks: [] }>()

defineProps<{
  top: ProductListItem | null
  songs: ProductListItem[]
  getDurationLabel?: (productCode: string) => string
}>()
</script>

<template>
  <div class="wrap">
    <div class="left">
      <div class="col-title">Kết quả hàng đầu</div>
      <div v-if="top" class="top-block">
        <div class="top-media">
          <div class="art" :style="{ background: top.thumbnailUrl || 'var(--grad-brand)' }" aria-hidden="true"></div>
        </div>
        <div class="top-meta">
          <div class="title">{{ top.title }}</div>
          <div class="muted artist">{{ top.artistDisplayName }}</div>
        </div>
      </div>
      <div v-else class="top-empty">
        <div class="muted">Không có kết quả phù hợp.</div>
      </div>
    </div>

    <div class="right">
      <button class="col-title link" type="button" @click="$emit('goTracks')">Bài hát liên quan</button>
      <div class="list">
        <RouterLink v-for="s in songs" :key="s.id" class="row" :to="`/product/${s.id}`">
          <div class="thumb" :style="{ background: s.thumbnailUrl || 'var(--c-bg-mute)' }" aria-hidden="true"></div>
          <div class="txt">
            <div class="name">{{ s.title }}</div>
            <div class="muted meta">{{ s.artistDisplayName }}</div>
          </div>
          <div class="muted dur">{{ getDurationLabel ? getDurationLabel(s.productCode) : '' }}</div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap { display: grid; grid-template-columns: 1.05fr 1fr; gap: 18px; }
.col-title {
  font-weight: 1000;
  font-size: 30px;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--c-text);
}
.col-title.link { background: transparent; border: none; padding: 0; text-align: left; cursor: pointer; }
.col-title.link:hover { text-decoration: underline; text-underline-offset: 4px; }
.top-block { margin-top: 10px; }
.top-media { padding: 0; overflow: hidden; border-radius: var(--radius-lg); }
.art {
  width: 100%;
  height: 212px;
  border-radius: var(--radius-lg);
  border: none;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
.top-meta { padding: 12px 2px 0; }
.title {
  font-weight: 900;
  font-size: 17px;
  letter-spacing: -0.01em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.artist { margin-top: 4px; font-weight: 600; color: var(--c-text-mute); }
.top-empty { margin-top: 10px; padding: 14px 0; }
.list { margin-top: 10px; display: grid;  }
.row {
  display: grid;
  grid-template-columns: 44px 1fr 64px;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 14px;
  border: none;
  background: transparent;
  color: inherit;
}
.row:hover .name { text-decoration: underline; }
.thumb { width: 44px; height: 44px; border-radius: 12px; border: none; }
.name { font-weight: 900; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.meta { font-size: 12px; margin-top: 2px; font-weight: 600; color: var(--c-text-mute); }
.dur { text-align: right; font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; }
@media (max-width: 980px) {
  .wrap { grid-template-columns: 1fr; }
  .art { width: 100%; height: 200px; }
}
</style>
