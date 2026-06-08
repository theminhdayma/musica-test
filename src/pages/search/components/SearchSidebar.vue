<script setup lang="ts">
type TimeKey = 'any' | 'hour' | 'day' | 'week' | 'month' | 'year'
type LengthKey = 'any' | 'lt2' | '2to4' | '4to6' | 'gt6'
type PurposeKey = 'any' | 'youtube' | 'performance'

const props = defineProps<{
  q: string
  activeTab: string
  showFilters: boolean
  timeKey: TimeKey
  lengthKey: LengthKey
  purposeKey: PurposeKey
}>()

const emit = defineEmits<{
  setTab: ['everything' | 'tracks' | 'artist' | 'playlists']
  updateFilters: [{ timeKey?: TimeKey; lengthKey?: LengthKey; purposeKey?: PurposeKey }]
}>()

function isActive(v: string) {
  return (props.activeTab || 'everything') === v
}
</script>

<template>
  <div class="panel">
    <nav class="tabs" aria-label="Bộ lọc tìm kiếm">
      <button class="tab" type="button" :data-active="isActive('everything')" @click="emit('setTab', 'everything')">Tất cả</button>
      <button class="tab" type="button" :data-active="isActive('tracks')" @click="emit('setTab', 'tracks')">Bài hát</button>
      <button class="tab" type="button" :data-active="isActive('artist')" @click="emit('setTab', 'artist')">Nghệ sĩ</button>
      <button class="tab" type="button" :data-active="isActive('playlists')" @click="emit('setTab', 'playlists')">Danh sách phát</button>
    </nav>

    <div v-if="showFilters" class="filters">
      <details open class="group group-time">
        <summary>Thời điểm</summary>
        <div class="opts">
          <button class="opt opt-plain" type="button" :data-active="timeKey === 'any'" @click="emit('updateFilters', { timeKey: 'any' })">Mọi lúc</button>
          <button class="opt opt-plain" type="button" :data-active="timeKey === 'hour'" @click="emit('updateFilters', { timeKey: 'hour' })">1 giờ qua</button>
          <button class="opt opt-plain" type="button" :data-active="timeKey === 'day'" @click="emit('updateFilters', { timeKey: 'day' })">24 giờ qua</button>
          <button class="opt opt-plain" type="button" :data-active="timeKey === 'week'" @click="emit('updateFilters', { timeKey: 'week' })">7 ngày qua</button>
          <button class="opt opt-plain" type="button" :data-active="timeKey === 'month'" @click="emit('updateFilters', { timeKey: 'month' })">30 ngày qua</button>
          <button class="opt opt-plain" type="button" :data-active="timeKey === 'year'" @click="emit('updateFilters', { timeKey: 'year' })">1 năm qua</button>
        </div>
      </details>

      <details class="group">
        <summary>Độ dài</summary>
        <div class="opts">
          <button class="opt opt-plain" type="button" :data-active="lengthKey === 'any'" @click="emit('updateFilters', { lengthKey: 'any' })">Tất cả</button>
          <button class="opt opt-plain" type="button" :data-active="lengthKey === 'lt2'" @click="emit('updateFilters', { lengthKey: 'lt2' })">&lt; 2 phút</button>
          <button class="opt opt-plain" type="button" :data-active="lengthKey === '2to4'" @click="emit('updateFilters', { lengthKey: '2to4' })">2–4 phút</button>
          <button class="opt opt-plain" type="button" :data-active="lengthKey === '4to6'" @click="emit('updateFilters', { lengthKey: '4to6' })">4–6 phút</button>
          <button class="opt opt-plain" type="button" :data-active="lengthKey === 'gt6'" @click="emit('updateFilters', { lengthKey: 'gt6' })">&gt; 6 phút</button>
        </div>
      </details>

      <details class="group">
        <summary>Mục đích sử dụng</summary>
        <div class="opts">
          <button class="opt opt-plain" type="button" :data-active="purposeKey === 'any'" @click="emit('updateFilters', { purposeKey: 'any' })">Tất cả</button>
          <button class="opt opt-plain" type="button" :data-active="purposeKey === 'youtube'" @click="emit('updateFilters', { purposeKey: 'youtube' })">YouTube</button>
          <button class="opt opt-plain" type="button" :data-active="purposeKey === 'performance'" @click="emit('updateFilters', { purposeKey: 'performance' })">Biểu diễn</button>
        </div>
      </details>
    </div>
  </div>
</template>

<style scoped>
.panel {
  padding: 10px 12px;
  background: var(--c-surface);
  border-radius: var(--radius-lg);
  max-height: calc(100vh - 120px);
  overflow: auto;
}
.tabs { display: grid; gap: 8px; margin-top: 0; }
.tab {
  width: 100%;
  text-align: left;
  cursor: pointer;
  border-radius: 10px;
  padding: 10px 12px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--c-text);
  font-weight: 900;
  font-size: 13.5px;
}
.tab[data-active="true"] {
  background: var(--c-blue-50);
  border-color: var(--c-blue-300);
  color: var(--c-blue-700);
}
.tab:not([data-active="true"]):hover { background: transparent; color: var(--c-text-mute); }
.tab[data-active="true"]:hover { background: var(--c-blue-50); border-color: var(--c-blue-300); color: var(--c-blue-700); }
.tab:focus-visible { outline: 2px solid var(--c-blue-400); outline-offset: 2px; }
.filters { margin-top: 12px; display: grid; gap: 10px; }
.group:not([open]) > :not(summary) { display: block; }
.group summary {
  cursor: pointer;
  font-weight: 900;
  color: var(--c-text);
  list-style: none;
}
.group summary:hover { color: var(--c-text-mute); }
.group summary::-webkit-details-marker { display: none; }
.opts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  max-height: 220px;
  overflow: auto;
  padding-right: 4px;
  opacity: 1;
  transform: translateY(0);
  transition: max-height 0.8s var(--ease-out), opacity 0.45s var(--ease-out), transform 0.8s var(--ease-out), margin-top 0.8s var(--ease-out);
  margin-top: 10px;
}
.group:not([open]) .opts {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateY(-6px);
  margin-top: 0;
  pointer-events: none;
  padding-right: 0;
}
.group-time .opts { max-height: 300px; overflow: visible; padding-right: 0; }
.group-time:not([open]) .opts { max-height: 0; overflow: hidden; }
.opt {
  width: 100%;
  text-align: left;
  cursor: pointer;
  border-radius: 10px;
  padding: 8px 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--c-text-soft);
  font-weight: 800;
  font-size: 12px;
}
.opt-plain { border-color: transparent; background: transparent; color: var(--c-text); font-weight: 900; }
.opt-plain[data-active="true"] { background: var(--c-blue-50); border-color: var(--c-blue-300); color: var(--c-blue-700); }
.opt-plain:not([data-active="true"]):hover { color: var(--c-text-mute); }
.opt-plain[data-active="true"]:hover { background: var(--c-blue-50); border-color: var(--c-blue-300); color: var(--c-blue-700); }
.opt-pill {
  border-color: var(--c-border);
  background: var(--c-bg-mute);
  color: var(--c-text-soft);
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  overflow-wrap: anywhere;
}
.opt-pill[data-active="true"] {
  background: var(--c-blue-50);
  border-color: var(--c-blue-300);
  color: var(--c-blue-700);
}
.opt-pill:not([data-active="true"]):hover { color: var(--c-text-mute); }
</style>
