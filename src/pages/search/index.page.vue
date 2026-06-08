<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { artists, products as rawProducts } from '../../data/catalog'
import { listProducts } from '../../modules/catalog/api'
import type { ProductListItem } from '../../modules/catalog/types'
import { ApiError } from '../../shared/api/errors'
import { useAsyncResource } from '../../shared/lib/useAsyncResource'
import ErrorState from '../../shared/ui/states/ErrorState.vue'
import SkeletonLine from '../../shared/ui/skeleton/SkeletonLine.vue'
import SearchSidebar from './components/SearchSidebar.vue'
import SearchTopAndSongs from './components/SearchTopAndSongs.vue'
import SearchPlaylistsSection from './components/SearchPlaylistsSection.vue'

useHead({
  title: 'Tìm kiếm — MusicA',
  meta: [{ name: 'description', content: 'Tìm kiếm tác phẩm, nghệ sĩ và thể loại trong marketplace tác quyền.' }]
})

const router = useRouter()
const route = useRoute()

const q = computed(() => (typeof route.params.q === 'string' ? route.params.q : ''))
const tab = computed(() => {
  const v = typeof route.params.tab === 'string' ? route.params.tab : ''
  if (!v || v === 'all') return 'everything'
  if (v === 'people') return 'artist'
  if (v === 'artist') return 'artist'
  if (v === 'tracks') return 'tracks'
  if (v === 'playlists') return 'playlists'
  return 'everything'
})

const genre = computed(() => (typeof route.query.genre === 'string' ? route.query.genre : ''))

type TimeKey = 'any' | 'hour' | 'day' | 'week' | 'month' | 'year'
type LengthKey = 'any' | 'lt2' | '2to4' | '4to6' | 'gt6'
type PurposeKey = 'any' | 'youtube' | 'performance'

const timeKey = ref<TimeKey>('any')
const lengthKey = ref<LengthKey>('any')
const purposeKey = ref<PurposeKey>('any')
const viewSwitching = ref(false)
let viewSwitchTimeout: number | null = null
const isBusy = computed(() => resource.status.value === 'loading' || viewSwitching.value)

const resource = useAsyncResource(async () => {
  return await listProducts({
    q: q.value.trim() || undefined,
    genre: genre.value || undefined,
    page: 1,
    pageSize: 50
  })
})

const allItems = computed<ProductListItem[]>(() => resource.data.value?.data.items || [])

const rawByCode = computed<Record<string, any>>(() => {
  const m: Record<string, any> = {}
  for (const p of rawProducts as any[]) {
    const code = p.isrc ? String(p.isrc) : `PROD-${String(p.id).slice(0, 6).padStart(6, '0')}`
    m[code] = p
  }
  return m
})

function parseDurationSeconds(v: string) {
  const parts = v.split(':').map(Number)
  if (parts.length !== 2 || parts.some(n => Number.isNaN(n))) return null
  return parts[0] * 60 + parts[1]
}

function getDurationLabel(productCode: string) {
  const p = rawByCode.value[productCode]
  const dur = p?.duration
  if (!dur) return '--:--'
  const s = parseDurationSeconds(String(dur))
  if (!s) return String(dur)
  const mm = Math.floor(s / 60)
  const ss = s % 60
  return `${mm}:${String(ss).padStart(2, '0')}`
}

function withinTime(productCode: string, key: TimeKey) {
  if (key === 'any') return true
  const p = rawByCode.value[productCode]
  const releaseDate = p?.releaseDate
  if (!releaseDate) return true
  const d = new Date(releaseDate).getTime()
  if (!Number.isFinite(d)) return true
  const now = Date.now()
  const diff = now - d
  const hour = 3600_000
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day
  if (key === 'hour') return diff <= hour
  if (key === 'day') return diff <= day
  if (key === 'week') return diff <= week
  if (key === 'month') return diff <= month
  return diff <= year
}

function withinLength(productCode: string, key: LengthKey) {
  if (key === 'any') return true
  const p = rawByCode.value[productCode]
  const dur = p?.duration
  if (!dur) return true
  const s = parseDurationSeconds(String(dur))
  if (!s) return true
  if (key === 'lt2') return s < 120
  if (key === '2to4') return s >= 120 && s < 240
  if (key === '4to6') return s >= 240 && s < 360
  return s >= 360
}

function withinPurpose(productCode: string, key: PurposeKey) {
  if (key === 'any') return true
  const p = rawByCode.value[productCode]
  const purposes = Array.isArray(p?.availablePurposes) ? p.availablePurposes : null
  if (!purposes) return true
  if (key === 'youtube') return purposes.includes('YOUTUBE')
  return purposes.includes('PERFORMANCE')
}

const filtered = computed(() => {
  if (tab.value !== 'tracks') return allItems.value
  return allItems.value.filter(it => withinTime(it.productCode, timeKey.value) && withinLength(it.productCode, lengthKey.value) && withinPurpose(it.productCode, purposeKey.value))
})

const topResult = computed(() => filtered.value[0] || null)
const popularSongs = computed(() => filtered.value.slice(1, 5))
const moreTracks = computed(() => filtered.value.slice(1, 13))

const errorRequestId = computed(() => (resource.error.value instanceof ApiError ? resource.error.value.requestId : null))
const errorMessage = computed(() => (resource.error.value instanceof ApiError ? resource.error.value.message : resource.error.value instanceof Error ? resource.error.value.message : 'Không thể tải dữ liệu'))

const artistItems = computed(() => artists.map(a => ({ id: a.id, name: a.name, tag: a.tag, tracks: a.tracks })))

function setTab(next: 'everything' | 'tracks' | 'artist' | 'playlists') {
  const params: Record<string, string> = {}
  if (q.value) params.q = q.value
  if (next !== 'everything') params.tab = next
  router.push({ name: 'search', params, query: genre.value ? { genre: genre.value } : {} })
}

function setGenre(nextGenre: string) {
  const params: Record<string, string> = {}
  if (q.value) params.q = q.value
  if (tab.value !== 'everything') params.tab = tab.value
  const query: Record<string, string> = {}
  if (nextGenre && nextGenre !== 'all') query.genre = nextGenre
  router.replace({ name: 'search', params, query })
}

function updateFilters(next: { timeKey?: TimeKey; lengthKey?: LengthKey; purposeKey?: PurposeKey }) {
  if (next.timeKey) timeKey.value = next.timeKey
  if (next.lengthKey) lengthKey.value = next.lengthKey
  if (next.purposeKey) purposeKey.value = next.purposeKey
}

function reload() {
  resource.run()
}

watch(
  () => [route.params.q, route.query.genre],
  () => {
    reload()
  }
)

watch(
  () => route.params.tab,
  () => {
    if (viewSwitchTimeout) window.clearTimeout(viewSwitchTimeout)
    viewSwitching.value = true
    viewSwitchTimeout = window.setTimeout(() => {
      viewSwitching.value = false
      viewSwitchTimeout = null
    }, 220)
  }
)

onMounted(() => {
  reload()
})
</script>

<template>
  <div class="search-page">
    <div class="container search-container">
      <div class="grid">
        <aside class="sidebar">
          <div class="sidebar-stack">
          
            <SearchSidebar
              :q="q"
              :active-tab="tab"
              :show-filters="tab === 'tracks'"
              :time-key="timeKey"
              :length-key="lengthKey"
              :purpose-key="purposeKey"
              @set-tab="setTab"
              @update-filters="updateFilters"
            />
          </div>
        </aside>

        <main class="content">
          <div v-if="isBusy" class="busy" aria-label="Loading">
            <div class="spinner"></div>
          </div>

          <template v-if="(resource.status.value === 'idle' || resource.status.value === 'loading') && !allItems.length">
            <div class="skeleton-head">
              <SkeletonLine width="40%" height="16px" />
              <SkeletonLine width="28%" height="12px" />
            </div>
            <div class="two-col">
              <div class="card">
                <SkeletonLine width="60%" height="14px" />
                <div style="height: 12px;"></div>
                <SkeletonLine width="40%" height="12px" />
              </div>
              <div class="card">
                <SkeletonLine width="55%" height="14px" />
                <div style="height: 12px;"></div>
                <SkeletonLine width="35%" height="12px" />
              </div>
            </div>
            <div class="card" style="margin-top: 12px;">
              <SkeletonLine width="30%" height="14px" />
              <div style="height: 12px;"></div>
              <SkeletonLine width="80%" height="12px" />
              <div style="height: 10px;"></div>
              <SkeletonLine width="70%" height="12px" />
            </div>
          </template>

          <ErrorState
            v-else-if="resource.status.value === 'error'"
            title="Không thể tải kết quả tìm kiếm"
            :message="errorMessage"
            :request-id="errorRequestId"
            :can-retry="true"
            @retry="reload"
          />

          <div v-else-if="!allItems.length" class="card">
            <div style="font-weight: 800;">Không có dữ liệu</div>
            <div class="muted" style="margin-top: 6px;">Thử từ khoá khác hoặc kiểm tra lại bộ lọc.</div>
          </div>

          <template v-else>
            <template v-if="tab === 'everything'">
              <SearchTopAndSongs :top="topResult" :songs="popularSongs" :get-duration-label="getDurationLabel" @go-tracks="setTab('tracks')" />

              <section class="everything-section">
                <button class="everything-title" type="button" @click="setTab('artist')">Nghệ sĩ</button>
                <div class="artists-grid">
                  <div v-for="a in artistItems.slice(0, 4)" :key="a.id" class="artist-card">
                    <div class="artist-cover">
                      <div class="artist-initial">{{ a.name.slice(0, 1) }}</div>
                    </div>
                    <div class="artist-info">
                      <div class="artist-name">{{ a.name }}</div>
                      <div class="artist-meta">{{ a.tag }}</div>
                    </div>
                  </div>
                </div>
              </section>

              <section class="everything-section">
                <button class="everything-title" type="button" @click="setTab('playlists')">Danh sách phát</button>
                <div class="muted playlists-empty">Chưa có dữ liệu.</div>
              </section>
            </template>

            <template v-else-if="tab === 'tracks'">
              <div class="tracks-table" style="margin-top: 14px;">
                <div class="tracks-header" aria-hidden="true">
                  <div>#</div>
                  <div>Bài hát</div>
                  <div class="tracks-duration">Thời lượng</div>
                </div>

                <div class="tracks-body">
                  <RouterLink
                    v-for="(t, idx) in moreTracks"
                    :key="t.id"
                    class="tracks-row"
                    :to="`/product/${t.id}`"
                  >
                    <div class="tracks-index">{{ idx + 1 }}</div>
                    <div class="tracks-songcell">
                      <div class="tracks-thumb" :style="{ background: t.thumbnailUrl || 'var(--c-bg-mute)' }" aria-hidden="true"></div>
                      <div class="tracks-main">
                        <div class="tracks-title">{{ t.title }}</div>
                        <div class="muted tracks-meta">{{ t.artistDisplayName }}</div>
                      </div>
                    </div>
                    <div class="muted tracks-duration">{{ getDurationLabel(t.productCode) }}</div>
                  </RouterLink>
                </div>
              </div>
            </template>

            <template v-else-if="tab === 'artist'">
              <section class="artist-tab">
                <div class="artists-grid">
                  <div v-for="a in artistItems" :key="a.id" class="artist-card artist-card-plain">
                    <div class="artist-cover">
                      <div class="artist-initial">{{ a.name.slice(0, 1) }}</div>
                    </div>
                    <div class="artist-info">
                      <div class="artist-name">{{ a.name }}</div>
                      <div class="artist-meta">{{ a.tag }}</div>
                    </div>
                  </div>
                </div>
              </section>
            </template>

            <template v-else>
              <SearchPlaylistsSection />
            </template>
          </template>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  background: var(--c-bg);
  color: var(--c-text);
  min-height: calc(100vh - 72px);
}
.search-container { padding-top: 18px; padding-bottom: 56px; }
.grid {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}
.sidebar {
  position: relative;
}
.sidebar-stack {
  position: sticky;
  top: 76px;
}
.sidebar-query {
  font-weight: 900;
  font-size: 13.5px;
  line-height: 1.15;
  padding: 2px 2px 0;
  margin-bottom: 10px;
}
.everything-section { margin-top: 26px; }
.everything-title {
  border: none;
  background: transparent;
  padding: 0;
  font-weight: 1000;
  font-size: 19px;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--c-text);
  text-align: left;
  cursor: pointer;
}
.everything-title:hover { text-decoration: underline; text-underline-offset: 4px; }
.artists-grid { margin-top: 12px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.artist-card { border-radius: 16px; border: 1px solid var(--c-border); background: var(--c-bg-mute); padding: 5px; overflow: hidden; }
.artist-tab .artists-grid { margin-top: 0; }
.artist-card-plain { border: none; }
.artist-cover {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background: var(--grad-brand);
  display: grid;
  place-items: center;
}
.artist-initial { font-weight: 1000; font-size: 28px; color: #fff; }
.artist-info { padding: 10px 8px 6px; }
.artist-name { font-weight: 700; font-size: 14px; color: var(--c-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.artist-meta { margin-top: 3px; font-weight: 600; font-size: 12px; color: var(--c-text-mute); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.artist-card:hover .artist-name { text-decoration: underline; text-underline-offset: 3px; }
.playlists-empty { margin-top: 10px; font-size: 13px; }
.content { position: relative; }
.busy {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  z-index: 2;
}
.spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--c-border);
  border-top-color: var(--c-teal-600);
  animation: spin 0.8s linear infinite;
}
.search-page :deep(.card:hover) {
  transform: none;
  box-shadow: none;
  border-color: var(--c-border);
}
.skeleton-head { display: grid; gap: 8px; }
.two-col { margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.tracks-header,
.tracks-row {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 84px;
  gap: 12px;
  align-items: center;
}
.tracks-header {
  padding: 8px 6px;
  font-weight: 900;
  font-size: 12px;
  color: var(--c-text-mute);
  border-bottom: 1px solid var(--c-border);
}
.tracks-body { display: grid; gap: 4px; }
.tracks-row {
  padding: 3px;
  border-radius: 12px;
  color: inherit;
}
.tracks-row:hover { background: var(--c-bg-mute); }
.tracks-index { padding: 5px; font-weight: 900; font-size: 12px; color: var(--c-text-mute); font-variant-numeric: tabular-nums; }
.tracks-songcell { padding: 5px; display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: 12px; align-items: center; }
.tracks-thumb { width: 44px; height: 44px; border-radius: 10px; }
.tracks-title { font-weight: 900; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tracks-meta { font-size: 12px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tracks-duration { padding: 5px; text-align: right; font-variant-numeric: tabular-nums; }
@media (max-width: 980px) {
  .grid { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .sidebar-stack { position: static; top: auto; }
  .artists-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .two-col { grid-template-columns: 1fr; }
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
