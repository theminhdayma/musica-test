<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  title?: string
  url: string
}>()

const open = ref(false)

const viewerUrl = computed(() => {
  const url = props.url || ''
  if (!url) return ''
  if (url.includes('#')) return url
  return `${url}#toolbar=0&navpanes=0&view=FitH`
})

const previewUrl = computed(() => {
  const url = viewerUrl.value
  if (!url) return ''
  return `${url}&zoom=page-width`
})

const watermarkImage = computed(() => {
  const text = 'MUSICA'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="180"><defs><style><![CDATA[text{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:30px;font-weight:1000;letter-spacing:7px;fill:#0f172a;opacity:.55}]]></style></defs><g transform="rotate(-18 130 90)"><text x="-20" y="60">${text}</text><text x="-20" y="120">${text}</text><text x="-20" y="180">${text}</text></g></svg>`
  const encoded = encodeURIComponent(svg)
  return `url("data:image/svg+xml,${encoded}")`
})

function openViewer() {
  open.value = true
}

function closeViewer() {
  open.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeViewer()
}

watch(open, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="pdv">
    <button class="pdv__card" type="button" @click="openViewer">
      <div class="pdv__thumb" :style="{ '--wm-image': watermarkImage }">
        <iframe v-if="previewUrl" class="pdv__thumb-frame" :src="previewUrl" loading="lazy" />
        <div class="pdv__thumb-mask" />
        <div class="pdv__wm" aria-hidden="true" />
        <div class="pdv__badge">PDF</div>
      </div>
      <div class="pdv__meta">
        <div class="pdv__name">{{ title || 'Mô tả tác phẩm' }}</div>
        <div class="pdv__sub">Nhấn để mở toàn màn hình</div>
      </div>
    </button>

    <Teleport to="body">
      <div v-if="open" class="pdv__overlay" @click.self="closeViewer">
        <div class="pdv__dialog">
          <div class="pdv__head">
            <div>
              <div class="pdv__head-label">File mô tả tác phẩm</div>
              <div class="pdv__head-title">{{ title || 'Mô tả tác phẩm' }}</div>
            </div>
            <button class="pdv__close" type="button" @click="closeViewer">×</button>
          </div>

          <div class="pdv__viewer">
            <iframe v-if="viewerUrl" class="pdv__iframe" :src="viewerUrl" />
            <div v-if="viewerUrl" class="pdv__wm pdv__wm--viewer" aria-hidden="true" :style="{ '--wm-image': watermarkImage }" />
            <div v-else class="pdv__empty">Không thể hiển thị file PDF</div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.pdv {
  margin-top: 16px;
}

.pdv__card {
  width: 280px;
  max-width: 100%;
  border: 1px solid var(--c-border);
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  padding: 0;
  cursor: pointer;
  text-align: left;
  font: inherit;
  box-shadow: var(--shadow-sm);
  transition: transform .2s var(--ease-out), box-shadow .2s var(--ease-out), border-color .2s var(--ease-out);
}

.pdv__card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  border-color: var(--c-blue-300);
}

.pdv__thumb {
  position: relative;
  height: 190px;
  background: #eef2f7;
  overflow: hidden;
}

.pdv__thumb-frame {
  width: 100%;
  height: 100%;
  border: 0;
  pointer-events: none;
  background: #fff;
}

.pdv__thumb-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.03), rgba(15, 23, 42, 0.14));
}

.pdv__wm {
  position: absolute;
  inset: -40px;
  pointer-events: none;
  background-image: var(--wm-image);
  background-repeat: repeat;
  background-size: 240px auto;
  opacity: 0.18;
  transform: rotate(-18deg);
  filter: grayscale(1);
}

.pdv__wm--viewer {
  inset: 0;
  opacity: 0.14;
  background-size: 320px auto;
}

.pdv__badge {
  position: absolute;
  left: 10px;
  top: 10px;
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(220, 38, 38, 0.95);
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.pdv__meta {
  padding: 12px 14px 14px;
}

.pdv__name {
  font-weight: 900;
  letter-spacing: -0.01em;
  color: var(--c-ink);
}

.pdv__sub {
  margin-top: 3px;
  font-size: 12px;
  color: var(--c-text-mute);
  font-weight: 600;
}

.pdv__overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.pdv__dialog {
  width: min(1200px, 100%);
  height: min(92vh, 100%);
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 32px 80px rgba(15, 23, 42, 0.32);
  display: flex;
  flex-direction: column;
}

.pdv__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--c-border);
  background: #fff;
}

.pdv__head-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--c-text-mute);
  font-weight: 800;
}

.pdv__head-title {
  margin-top: 2px;
  font-size: 15px;
  font-weight: 900;
  color: var(--c-ink);
}

.pdv__close {
  width: 38px;
  height: 38px;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  background: #fff;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.pdv__viewer {
  flex: 1;
  min-height: 0;
  background: #dbe3ee;
  position: relative;
}

.pdv__iframe {
  width: 100%;
  height: 100%;
  border: 0;
  background: #fff;
}

.pdv__empty {
  height: 100%;
  display: grid;
  place-items: center;
  color: var(--c-text-mute);
  font-weight: 600;
}

@media (max-width: 768px) {
  .pdv__card {
    width: 100%;
  }

  .pdv__thumb {
    height: 170px;
  }

  .pdv__overlay {
    padding: 10px;
  }

  .pdv__dialog {
    height: min(96vh, 100%);
    border-radius: 16px;
  }
}
</style>
