<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { getProduct, products, formatVND, defaultDeliverables } from '../data/catalog'
import { toInternalProductId } from '../modules/catalog/idMap'
import { useCartStore } from '../stores/cart'
import ProductCard from '../components/product/ProductCard.vue'
import WaveBars from '../components/ui/WaveBars.vue'
import CheckList from '../components/ui/CheckList.vue'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()

const internalProductId = computed(() => toInternalProductId(String(route.params.id || '')))
const product = computed(() => getProduct(internalProductId.value))

const purpose = ref('youtube') // 'youtube' | 'performance'

// Youtube variants
const ytMonetize = ref(true)
const ytDurationKey = ref('12')
const ytScope = ref('global')

// Performance variants
const perfShows = ref(1)
const perfScale = ref('medium')

const ytDurations = [
  { k: '6',  label: '6 tháng',  mult: 0.55 },
  { k: '12', label: '12 tháng', mult: 1.00 },
  { k: '24', label: '2 năm',    mult: 1.70 },
  { k: '36', label: '3 năm',    mult: 2.30 }
]

const perfScales = [
  { k: 'small',  label: 'Dưới 200 khách',     mult: 1.0,  desc: 'Sự kiện nội bộ, club, lounge' },
  { k: 'medium', label: '200 — 1.000 khách',   mult: 1.8,  desc: 'Hội thảo, gala, fanmeeting' },
  { k: 'large',  label: '1.000 — 5.000 khách', mult: 3.2,  desc: 'Concert vừa, music night' },
  { k: 'arena',  label: 'Trên 5.000 khách',    mult: 5.5,  desc: 'Festival, arena, đại nhạc hội' }
]

const isPlaying = ref(false)
const progress = ref(0)
let raf
function togglePlay() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) loopProgress()
  else cancelAnimationFrame(raf)
}
function loopProgress() {
  progress.value = (progress.value + 0.3) % 100
  raf = requestAnimationFrame(loopProgress)
}

const peaks = computed(() => (product.value?.samplePeak || []).map(v => v / 60))

// Price calculation
const calc = computed(() => {
  if (!product.value) return null
  const base = product.value.basePrice
  if (purpose.value === 'youtube') {
    const d = ytDurations.find(x => x.k === ytDurationKey.value)
    const monetizeMult = ytMonetize.value ? 1.5 : 1.0
    const scopeMult = ytScope.value === 'global' ? 1.0 : 0.7
    const total = Math.round(base * d.mult * monetizeMult * scopeMult)
    return {
      total,
      breakdown: [
        { label: 'Giá cơ bản tác quyền', value: base },
        { label: `Thời hạn — ${d.label}`, mult: d.mult },
        { label: `Bật kiếm tiền — ${ytMonetize.value ? 'Có' : 'Không'}`, mult: monetizeMult },
        { label: `Phạm vi — ${ytScope.value === 'global' ? 'Toàn cầu' : 'Việt Nam'}`, mult: scopeMult }
      ],
      summary: {
        'Mục đích': 'Phát hành YouTube',
        'Thời hạn': d.label,
        'Bật kiếm tiền': ytMonetize.value ? 'Có' : 'Không',
        'Phạm vi': ytScope.value === 'global' ? 'Toàn cầu' : 'Việt Nam'
      }
    }
  }
  const s = perfScales.find(x => x.k === perfScale.value)
  const total = Math.round(base * s.mult * (1 + (perfShows.value - 1) * 0.6))
  return {
    total,
    breakdown: [
      { label: 'Giá cơ bản tác quyền', value: base },
      { label: `Quy mô — ${s.label}`, mult: s.mult },
      { label: `Số buổi — ${perfShows.value} buổi`, mult: 1 + (perfShows.value - 1) * 0.6 }
    ],
    summary: {
      'Mục đích': 'Biểu diễn trực tiếp',
      'Quy mô': s.label,
      'Số buổi': `${perfShows.value} buổi`
    }
  }
})

const related = computed(() =>
  products.filter(p => p.id !== product.value?.id && p.category === product.value?.category).slice(0, 4)
)

const addedFlash = ref(false)
function addToCart() {
  if (!product.value || !calc.value) return
  cart.add({
    productId: product.value.id,
    title: product.value.title,
    artist: product.value.artist,
    cover: product.value.cover,
    price: calc.value.total,
    configuration: calc.value.summary
  })
  addedFlash.value = true
  setTimeout(() => addedFlash.value = false, 1400)
}

function buyNow() {
  addToCart()
  setTimeout(() => router.push('/cart'), 200)
}

watch(() => route.params.id, () => {
  purpose.value = 'youtube'
  ytMonetize.value = true
  ytDurationKey.value = '12'
  perfShows.value = 1
  perfScale.value = 'medium'
})

function formatDate(s) {
  return new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatTime(pct, duration) {
  const [m, s] = duration.split(':').map(Number)
  const total = m * 60 + s
  const cur = Math.floor(total * pct / 100)
  return `${Math.floor(cur / 60)}:${String(cur % 60).padStart(2, '0')}`
}
</script>

<template>
  <div v-if="!product" class="not-found container">
    <h2>Không tìm thấy tác phẩm</h2>
    <RouterLink class="btn btn-primary" to="/">Quay lại trang chủ</RouterLink>
  </div>

  <div v-else class="product-page">
    <!-- Breadcrumb -->
    <div class="container crumbs">
      <RouterLink to="/">Trang chủ</RouterLink>
      <span>›</span>
      <RouterLink to="/" class="muted">{{ product.category.toUpperCase() }}</RouterLink>
      <span>›</span>
      <span class="muted">{{ product.title }}</span>
    </div>

    <section class="hero-product">
      <div class="container product-grid">
        <!-- Left column -->
        <div class="left">
          <!-- Compact player card -->
          <div class="player-card">
            <div class="player-row">
              <div class="art" :style="{ background: product.cover }" aria-hidden="true">
                <button class="play" @click="togglePlay" :aria-label="isPlaying ? 'Tạm dừng' : 'Phát'">
                  <svg v-if="!isPlaying" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                </button>
              </div>
              <div class="meta-block">
                <div class="title-row">
                  <span class="badge-cat">{{ product.category.toUpperCase() }}</span>
                  <span class="isrc">ISRC · {{ product.isrc }}</span>
                </div>
                <h1>{{ product.title }}</h1>
                <p class="byline">{{ product.artist }} · {{ product.publisher }}</p>
                <div class="wave-line">
                  <WaveBars :peaks="peaks" size="sm" variant="muted" :progress="progress" />
                  <span class="time">{{ formatTime(progress, product.duration) }} <em>/ {{ product.duration }}</em></span>
                </div>
              </div>
            </div>
            <div class="meta-row">
              <div><span>BPM</span><b>{{ product.bpm }}</b></div>
              <div><span>Tông</span><b>{{ product.key }}</b></div>
              <div><span>Phát hành</span><b>{{ formatDate(product.releaseDate) }}</b></div>
              <div><span>Mood</span><b>{{ product.mood }}</b></div>
            </div>
          </div>

          <div class="info-block">
            <h3>Về tác phẩm</h3>
            <p>{{ product.description }}</p>
            <div class="tags">
              <span v-for="t in product.tags" :key="t" class="tag">{{ t }}</span>
            </div>
          </div>

          <!-- Contents included -->
          <div class="info-block">
            <h3>Nội dung tác quyền bao gồm</h3>
            <p class="muted">Khi mua tác quyền, nghệ sĩ sẽ bàn giao đầy đủ các tài sản số sau đây kèm hợp đồng:</p>
            <CheckList :items="defaultDeliverables" />
          </div>

          <div class="info-block">
            <h3>Quyền sở hữu & xác minh</h3>
            <ul class="ownership">
              <li><span>Chủ sở hữu</span><b>{{ product.publisher }}</b></li>
              <li><span>Mã ISRC</span><b>{{ product.isrc }}</b></li>
              <li><span>Tác giả</span><b>{{ product.artist }}</b></li>
              <li><span>Ngày đăng ký bản quyền</span><b>{{ formatDate(product.releaseDate) }}</b></li>
              <li><span>Trạng thái xác minh</span><b class="ok">✓ Đã xác minh trên MusicA</b></li>
            </ul>
          </div>
        </div>

        <!-- Right: variant configurator -->
        <aside class="right">
          <div class="config-card">
            <div class="config-head">
              <span class="eyebrow">Cấu hình tác quyền</span>
              <h2>Tuỳ chọn gói mua</h2>
            </div>

            <div class="field">
              <label class="field-label">1. Mục đích sử dụng</label>
              <div class="purpose-grid">
                <button :class="['ptile', { active: purpose === 'youtube' }]" @click="purpose = 'youtube'">
                  <div class="picon yt">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23 7.5a4 4 0 0 0-2.8-2.8C18.3 4.2 12 4.2 12 4.2s-6.3 0-8.2.5A4 4 0 0 0 1 7.5 41.6 41.6 0 0 0 .5 12a41.6 41.6 0 0 0 .5 4.5 4 4 0 0 0 2.8 2.8c1.9.5 8.2.5 8.2.5s6.3 0 8.2-.5A4 4 0 0 0 23 16.5 41.6 41.6 0 0 0 23.5 12a41.6 41.6 0 0 0-.5-4.5zM9.8 15.5v-7l6 3.5z" /></svg>
                  </div>
                  <strong>Phát hành YouTube</strong>
                  <span>MV, vlog, short-form</span>
                </button>
                <button :class="['ptile', { active: purpose === 'performance' }]" @click="purpose = 'performance'">
                  <div class="picon perf">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22" /><path d="M19 5v14" /><path d="M5 5v14" /><circle cx="12" cy="12" r="3" /></svg>
                  </div>
                  <strong>Biểu diễn trực tiếp</strong>
                  <span>Concert, sự kiện, gala</span>
                </button>
              </div>
            </div>

            <transition name="swap" mode="out-in">
              <div v-if="purpose === 'youtube'" key="yt" class="field-group">
                <div class="field">
                  <label class="field-label">2. Bật kiếm tiền</label>
                  <div class="toggle-row">
                    <button :class="['toggle', { active: ytMonetize }]" @click="ytMonetize = !ytMonetize" :aria-pressed="ytMonetize">
                      <span class="dot"></span>
                    </button>
                    <div class="toggle-text">
                      <strong>{{ ytMonetize ? 'Có bật kiếm tiền' : 'Không bật kiếm tiền' }}</strong>
                      <span>{{ ytMonetize ? 'Cho phép YouTube monetize nội dung.' : 'Chỉ dùng phi thương mại, giá thấp hơn.' }}</span>
                    </div>
                  </div>
                </div>

                <div class="field">
                  <label class="field-label">3. Thời hạn</label>
                  <div class="seg">
                    <button v-for="d in ytDurations" :key="d.k"
                            :class="['seg-btn', { active: ytDurationKey === d.k }]"
                            @click="ytDurationKey = d.k">{{ d.label }}</button>
                  </div>
                </div>

                <div class="field">
                  <label class="field-label">4. Phạm vi địa lý</label>
                  <div class="seg">
                    <button :class="['seg-btn', { active: ytScope === 'global' }]" @click="ytScope = 'global'">🌐 Toàn cầu</button>
                    <button :class="['seg-btn', { active: ytScope === 'vn' }]" @click="ytScope = 'vn'">🇻🇳 Việt Nam</button>
                  </div>
                </div>
              </div>

              <div v-else key="perf" class="field-group">
                <div class="field">
                  <label class="field-label">2. Quy mô sự kiện</label>
                  <div class="scale-list">
                    <button v-for="s in perfScales" :key="s.k"
                            :class="['scale-row', { active: perfScale === s.k }]"
                            @click="perfScale = s.k">
                      <div class="scale-radio"></div>
                      <div class="scale-body">
                        <strong>{{ s.label }}</strong>
                        <span>{{ s.desc }}</span>
                      </div>
                      <span class="scale-mult">×{{ s.mult.toFixed(1) }}</span>
                    </button>
                  </div>
                </div>

                <div class="field">
                  <label class="field-label">3. Số buổi biểu diễn</label>
                  <div class="counter">
                    <button @click="perfShows = Math.max(1, perfShows - 1)" aria-label="Giảm">−</button>
                    <div class="counter-val">{{ perfShows }} <small>buổi</small></div>
                    <button @click="perfShows = Math.min(30, perfShows + 1)" aria-label="Tăng">+</button>
                  </div>
                </div>
              </div>
            </transition>

            <div class="price-summary">
              <div class="ps-rows">
                <div v-for="(r, i) in calc.breakdown" :key="i" class="ps-row">
                  <span>{{ r.label }}</span>
                  <span v-if="r.value">{{ formatVND(r.value) }}</span>
                  <span v-else class="mult">× {{ r.mult.toFixed(2) }}</span>
                </div>
              </div>
              <div class="ps-total">
                <span>Tạm tính</span>
                <transition name="price"><strong :key="calc.total" class="gradient-text">{{ formatVND(calc.total) }}</strong></transition>
              </div>
              <small class="muted">Chưa gồm phí xử lý 4% & VAT. Hợp đồng số phát hành ngay sau thanh toán.</small>
            </div>

            <div class="actions">
              <button class="btn btn-primary btn-lg" @click="buyNow">Tiến hành mua tác quyền</button>
              <button class="btn btn-ghost btn-lg" @click="addToCart">
                <span v-if="!addedFlash">Thêm vào giỏ</span>
                <span v-else>✓ Đã thêm</span>
              </button>
            </div>

            <div class="micro-trust">
              <span>🔒 Thanh toán bảo mật</span>
              <span>📜 Ký xác thực điện tử</span>
              <span>↩ Hoàn tiền nếu xung đột</span>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Related -->
    <section class="section related">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <span class="eyebrow">Cùng thể loại</span>
            <h2>Tác phẩm bạn có thể thích</h2>
          </div>
        </div>
        <div class="grid">
          <div v-for="(p, i) in related" :key="p.id" class="reveal" :style="{ transitionDelay: (i * 50) + 'ms' }">
            <ProductCard :product="p" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.not-found { padding: 120px 0; text-align: center; }

.crumbs { padding: 22px 0 8px; display: flex; gap: 8px; align-items: center; font-size: 13px; color: var(--c-text-soft); }
.crumbs a { color: var(--c-blue-700); }
.crumbs .muted { color: var(--c-text-mute); }

.hero-product { padding: 18px 0 60px; }
.product-grid {
  display: grid;
  grid-template-columns: 1.25fr 0.9fr;
  gap: 32px;
  align-items: start;
}
@media (max-width: 980px) { .product-grid { grid-template-columns: 1fr; } }

/* ---------- Compact player card ---------- */
.player-card {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.player-row {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 18px;
  padding: 18px;
}
.art {
  position: relative;
  width: 130px; height: 130px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.art::after {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(100% 60% at 0% 100%, rgba(0,0,0,0.18), transparent 60%);
}
.play {
  position: relative;
  z-index: 1;
  width: 44px; height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.92);
  color: var(--c-blue-700);
  border: none;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-md);
  transition: transform .25s var(--ease-out);
}
.play:hover { transform: scale(1.08); }
.play.active { animation: pulseRing 2s infinite; }

.meta-block { min-width: 0; }
.title-row { display: flex; align-items: center; gap: 8px; }
.badge-cat {
  background: var(--c-blue-50);
  color: var(--c-blue-700);
  padding: 3px 8px;
  border-radius: var(--radius-full);
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.isrc {
  font-size: 11px;
  color: var(--c-text-mute);
  letter-spacing: 0.04em;
}
.meta-block h1 {
  font-size: clamp(20px, 2.6vw, 28px);
  margin: 8px 0 2px;
  font-weight: 800;
  letter-spacing: -0.02em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.byline { margin: 0 0 12px; color: var(--c-text-soft); font-size: 13px; }

.wave-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}
.time {
  font-size: 11.5px;
  color: var(--c-text-soft);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
.time em { color: var(--c-text-mute); font-style: normal; }

.meta-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--c-border);
  background: var(--c-bg-soft);
}
.meta-row > div {
  padding: 10px 16px;
  border-right: 1px solid var(--c-border);
}
.meta-row > div:last-child { border-right: none; }
.meta-row span { display: block; font-size: 10.5px; color: var(--c-text-mute); text-transform: uppercase; letter-spacing: 0.08em; }
.meta-row b { font-size: 13px; }

.info-block {
  margin-top: 18px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding: 20px 22px;
}
.info-block h3 { margin: 0 0 10px; font-size: 15.5px; }
.info-block p { margin: 0 0 8px; color: var(--c-text-soft); line-height: 1.65; font-size: 14px; }
.info-block p.muted { color: var(--c-text-mute); font-size: 13px; margin-bottom: 14px; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.tag {
  padding: 4px 10px;
  background: var(--c-blue-50);
  color: var(--c-blue-700);
  font-size: 11.5px;
  font-weight: 600;
  border-radius: var(--radius-full);
}

.ownership { list-style: none; padding: 0; margin: 0; }
.ownership li {
  display: flex; justify-content: space-between; gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed var(--c-border);
  font-size: 13.5px;
}
.ownership li:last-child { border-bottom: none; }
.ownership li span { color: var(--c-text-mute); }
.ownership li b.ok { color: var(--c-teal-600); }

/* ---------- Config card ---------- */
.right { position: sticky; top: 100px; }
.config-card {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-md);
}
.config-head h2 { margin: 8px 0 16px; font-size: 19px; letter-spacing: -0.01em; }

.field { margin-bottom: 18px; }
.field-label {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--c-text);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.purpose-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.ptile {
  text-align: left;
  padding: 12px;
  background: #fff;
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-md);
  transition: border-color .25s, background .25s, transform .25s, box-shadow .25s;
}
.ptile:hover { border-color: var(--c-blue-300); transform: translateY(-2px); }
.ptile.active {
  border-color: var(--c-teal-500);
  background: linear-gradient(180deg, #f3fdfa, #ffffff);
  box-shadow: 0 8px 24px rgba(20,184,166,0.18);
}
.picon {
  width: 32px; height: 32px;
  border-radius: 9px;
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 8px;
  color: #fff;
}
.picon.yt { background: #ef4444; }
.picon.perf { background: var(--grad-brand); }
.ptile strong { display: block; font-size: 13.5px; }
.ptile span { display: block; font-size: 11.5px; color: var(--c-text-mute); margin-top: 2px; line-height: 1.45; }

.field-group { animation: rise .35s var(--ease-out); }
.swap-enter-active, .swap-leave-active { transition: opacity .25s, transform .25s; }
.swap-enter-from { opacity: 0; transform: translateY(8px); }
.swap-leave-to { opacity: 0; transform: translateY(-8px); }

.toggle-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px;
  background: var(--c-bg-soft);
  border-radius: var(--radius-md);
  border: 1px solid var(--c-border);
}
.toggle {
  position: relative;
  width: 42px; height: 24px;
  border-radius: var(--radius-full);
  background: var(--c-border-strong);
  border: none;
  flex-shrink: 0;
  transition: background .25s;
}
.toggle .dot {
  position: absolute;
  top: 3px; left: 3px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: var(--shadow-xs);
  transition: transform .3s var(--ease-out);
}
.toggle.active { background: var(--grad-brand); }
.toggle.active .dot { transform: translateX(18px); }
.toggle-text strong { display: block; font-size: 13px; }
.toggle-text span { display: block; font-size: 11.5px; color: var(--c-text-mute); margin-top: 1px; }

.seg {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  background: var(--c-bg-soft);
  padding: 4px;
  border-radius: var(--radius-full);
  border: 1px solid var(--c-border);
}
.seg-btn {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 12.5px;
  color: var(--c-text-soft);
  transition: background .25s, color .25s, box-shadow .25s;
  min-width: max-content;
}
.seg-btn:hover { color: var(--c-text); }
.seg-btn.active {
  background: #fff;
  color: var(--c-blue-700);
  box-shadow: var(--shadow-xs);
}

.scale-list { display: flex; flex-direction: column; gap: 6px; }
.scale-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1.5px solid var(--c-border);
  border-radius: var(--radius-md);
  text-align: left;
  transition: border-color .25s, background .25s;
}
.scale-row:hover { border-color: var(--c-blue-300); }
.scale-row.active {
  border-color: var(--c-teal-500);
  background: linear-gradient(180deg, #f3fdfa, #ffffff);
}
.scale-radio {
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 2px solid var(--c-border-strong);
  position: relative;
  flex-shrink: 0;
  transition: border-color .25s;
}
.scale-row.active .scale-radio { border-color: var(--c-teal-500); }
.scale-row.active .scale-radio::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: var(--c-teal-500);
}
.scale-body { flex: 1; }
.scale-body strong { display: block; font-size: 13.5px; }
.scale-body span { display: block; font-size: 11.5px; color: var(--c-text-mute); margin-top: 1px; }
.scale-mult {
  font-weight: 800;
  color: var(--c-blue-700);
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
}

.counter {
  display: flex;
  align-items: stretch;
  background: var(--c-bg-soft);
  border-radius: var(--radius-full);
  border: 1px solid var(--c-border);
  padding: 4px;
}
.counter button {
  width: 36px;
  border: none;
  background: #fff;
  border-radius: var(--radius-full);
  font-size: 16px;
  font-weight: 700;
  color: var(--c-blue-700);
  transition: background .2s;
}
.counter button:hover { background: var(--c-blue-50); }
.counter-val {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  font-size: 15px;
  gap: 4px;
}
.counter-val small { font-size: 11.5px; color: var(--c-text-mute); font-weight: 500; }

.price-summary {
  margin-top: 22px;
  padding: 16px;
  background: linear-gradient(180deg, var(--c-blue-50), #fff);
  border: 1px solid var(--c-blue-100);
  border-radius: var(--radius-md);
}
.ps-rows { display: flex; flex-direction: column; gap: 6px; }
.ps-row {
  display: flex; justify-content: space-between; gap: 12px;
  font-size: 12.5px;
  color: var(--c-text-soft);
}
.ps-row .mult { color: var(--c-blue-700); font-weight: 600; font-variant-numeric: tabular-nums; }
.ps-total {
  position: relative;
  min-height: 32px;
  display: flex; justify-content: space-between; align-items: baseline;
  margin-top: 12px; padding-top: 12px;
  border-top: 1px dashed var(--c-blue-100);
}
.ps-total span { font-size: 12.5px; color: var(--c-text-soft); font-weight: 600; }
.ps-total strong { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }

.price-enter-active, .price-leave-active { transition: opacity .25s, transform .25s; position: absolute; right: 0; }
.price-enter-from { opacity: 0; transform: translateY(6px); }
.price-leave-to { opacity: 0; transform: translateY(-6px); }

.muted { color: var(--c-text-mute); font-size: 11.5px; display: block; margin-top: 6px; }

.actions {
  display: flex; flex-direction: column; gap: 8px;
  margin-top: 16px;
}

.micro-trust {
  margin-top: 14px;
  display: flex; flex-wrap: wrap; gap: 4px 14px;
  font-size: 11px;
  color: var(--c-text-mute);
  justify-content: center;
}

/* Related */
.related .grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
@media (max-width: 1024px) { .related .grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 760px) { .related .grid { grid-template-columns: repeat(2, 1fr); } }

@media (max-width: 980px) {
  .right { position: static; }
}
@media (max-width: 560px) {
  .player-row { grid-template-columns: 100px 1fr; gap: 14px; padding: 14px; }
  .art { width: 100px; height: 100px; }
  .meta-row > div { padding: 8px 12px; }
}
</style>
