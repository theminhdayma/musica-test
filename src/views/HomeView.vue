<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { products, categories, artists } from '../data/catalog'
import ProductCard from '../components/product/ProductCard.vue'
import WaveBars from '../components/ui/WaveBars.vue'
import SectionHead from '../components/ui/SectionHead.vue'
import CheckList from '../components/ui/CheckList.vue'

const router = useRouter()
const activeCat = ref('all')
const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return products.filter(p => {
    const matchCat = activeCat.value === 'all' || p.category === activeCat.value
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.artist.toLowerCase().includes(q) || p.tags.join(' ').toLowerCase().includes(q)
    return matchCat && matchQ
  })
})

const stats = [
  { v: '12K+', l: 'Tác phẩm có bản quyền' },
  { v: '850+', l: 'Nghệ sĩ & Nhà phát hành' },
  { v: '38K+', l: 'Tác quyền đã giao dịch' },
  { v: '99.2%', l: 'Tỷ lệ xác minh hợp lệ' }
]

const benefits = [
  { icon: 'shield', title: 'Giao dịch minh bạch',  text: 'Mọi tác phẩm gắn liền hồ sơ pháp lý, lịch sử giao dịch được lưu vết on-chain.' },
  { icon: 'bolt',   title: 'Bàn giao tức thì',     text: 'Hợp đồng ký số, bộ tài sản tác quyền được phát hành ngay sau khi thanh toán.' },
  { icon: 'layers', title: 'Linh hoạt biến thể',   text: 'Tuỳ biến mục đích, thời hạn, quy mô và nền tảng khai thác phù hợp nhu cầu.' },
  { icon: 'globe',  title: 'Đa nền tảng',           text: 'Mua tác quyền cho YouTube, biểu diễn, livestream, TVC, podcast, short-form.' }
]

const steps = [
  { n: '01', title: 'Khám phá tác phẩm', text: 'Tìm theo nghệ sĩ, thể loại, mood — nghe sample chất lượng cao.' },
  { n: '02', title: 'Cấu hình gói tác quyền', text: 'Chọn mục đích, quy mô và thời gian — giá hiển thị minh bạch theo thời gian thực.' },
  { n: '03', title: 'Ký hợp đồng số',    text: 'Ký xác thực điện tử theo Luật Giao dịch điện tử Việt Nam.' },
  { n: '04', title: 'Nhận bộ tài sản',    text: 'Nghệ sĩ bàn giao file âm thanh, khuông nhạc, giấy SHTT và ID xác minh.' }
]

const useCases = [
  {
    title: 'Creator & Publisher',
    text: 'Chọn tác phẩm theo mood, set phạm vi và bật kiếm tiền ngay khi publish.',
    points: ['YouTube & podcast', 'Livestream & shorts', 'Export hợp đồng PDF', 'ID xác minh giao dịch']
  },
  {
    title: 'Brand & Agency',
    text: 'Tối ưu quy trình mua tác quyền cho TVC, social và chiến dịch đa nền tảng.',
    points: ['Theo ngân sách', 'Theo thời hạn', 'Theo phạm vi', 'Theo nền tảng']
  },
  {
    title: 'Studio & Event',
    text: 'Giấy tờ rõ ràng cho biểu diễn, sân khấu, festival hoặc không gian thương mại.',
    points: ['Biểu diễn 1 lần', 'Theo số khách', 'Theo địa điểm', 'Lưu vết minh bạch']
  },
  {
    title: 'Team nội bộ',
    text: 'Chuẩn hoá quy trình mua và lưu trữ asset tác quyền theo dự án.',
    points: ['Asset handover', 'Hồ sơ pháp lý', 'Quy trình kiểm tra', 'Tái sử dụng an toàn']
  }
]

const faqs = [
  {
    q: 'MusicA có đảm bảo tính pháp lý cho giao dịch tác quyền không?',
    a: 'Mỗi tác phẩm đi kèm hồ sơ xác minh và điều khoản sử dụng rõ ràng theo mục đích, thời hạn và phạm vi. Bạn có thể tải hợp đồng PDF và ID xác minh sau khi giao dịch.'
  },
  {
    q: 'Tôi có thể mua tác quyền cho YouTube/TikTok/Livestream không?',
    a: 'Có. Bạn chọn nền tảng khai thác trong bước cấu hình gói tác quyền. Giá và điều khoản hiển thị minh bạch trước khi thanh toán.'
  },
  {
    q: 'Sau khi thanh toán tôi nhận được những gì?',
    a: 'Bạn nhận bộ tài sản tác quyền (file âm thanh, tài liệu đi kèm) và hợp đồng số/biên nhận với ID xác minh để lưu trữ hoặc cung cấp cho đối tác.'
  },
  {
    q: 'Có yêu cầu thẻ thanh toán để trải nghiệm không?',
    a: 'Không. Bạn có thể tạo tài khoản, khám phá thư viện và trải nghiệm quy trình cấu hình gói trước khi quyết định giao dịch.'
  }
]

const ctaChecks = [
  'Không yêu cầu thẻ thanh toán',
  '1 gói tác quyền thử nghiệm miễn phí',
  'Hỗ trợ YouTube, TikTok, Facebook',
  'Hợp đồng PDF kèm ID xác minh'
]

function pickCat(id) { activeCat.value = id }
function goMarket() {
  const q = search.value.trim()
  if (q) router.push({ name: 'search', params: { q } })
  else router.push({ name: 'search' })
}
</script>

<template>
  <div class="home-view">
  <!-- HERO -->
  <section class="hero">
    <div class="orb orb-a"></div>
    <div class="orb orb-b"></div>
    <div class="orb orb-c"></div>

    <div class="container hero-inner">
      <div class="hero-copy">
        <span class="eyebrow rise-in rise-in-1">
          <i class="dot"></i> Thương mại điện tử tác quyền âm nhạc · 2026
        </span>
        <h1 class="rise-in rise-in-2">
          Mua tác quyền <span class="keep-together">âm nhạc</span> <br />
          <span class="gradient-text">trực tiếp từ nghệ sĩ.</span>
        </h1>
        <p class="lead rise-in rise-in-3">
          MusicA là nền tảng thương mại điện tử kết nối người mua với nghệ sĩ — minh bạch,
          an toàn pháp lý và bàn giao đầy đủ bộ tài sản tác quyền chỉ trong vài phút.
        </p>

        <form class="hero-search rise-in rise-in-4" @submit.prevent="goMarket">
          <svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input v-model="search" type="text" placeholder="Tìm bài hát, nghệ sĩ, tâm trạng… (vd: lo-fi, Lena Vũ)" />
          <button class="btn btn-primary" type="submit">Tìm tác quyền</button>
        </form>

        <div class="hero-trust rise-in rise-in-5">
          <span class="hero-trust-item">Không cần thẻ</span>
          <span class="hero-trust-dot" aria-hidden="true"></span>
          <span class="hero-trust-item">Hợp đồng số</span>
          <span class="hero-trust-dot" aria-hidden="true"></span>
          <span class="hero-trust-item">Bàn giao đầy đủ asset</span>
        </div>

        <div class="hero-suggest rise-in rise-in-5">
          <span class="hint">Phổ biến:</span>
          <a v-for="t in ['Lo-fi cho podcast', 'EDM festival', 'Ballad TVC', 'Biểu diễn 500 khách']" :key="t" @click.prevent="search = t">{{ t }}</a>
        </div>

        <div class="hero-stats">
          <div v-for="(s, i) in stats" :key="i" class="stat reveal" :style="{ transitionDelay: (i * 60) + 'ms' }">
            <strong>{{ s.v }}</strong>
            <span>{{ s.l }}</span>
          </div>
        </div>
      </div>

      <div class="hero-art" aria-hidden="true">
        <div class="license-card floating">
          <div class="lc-head">
            <span class="lc-tag">Tác quyền #VN-MUS-25-00510</span>
            <span class="lc-status"><i></i> Hợp lệ</span>
          </div>
          <div class="lc-title">Bão giữa lồng ngực</div>
          <div class="lc-sub">Mira Hồ · V-Pop · 3:55</div>
          <div class="lc-grid">
            <div><span>Mục đích</span><b>YouTube</b></div>
            <div><span>Thời hạn</span><b>12 tháng</b></div>
            <div><span>Bật kiếm tiền</span><b>Có</b></div>
            <div><span>Phạm vi</span><b>Toàn cầu</b></div>
          </div>
          <div class="lc-foot">
            <div class="qr">
              <div v-for="i in 36" :key="i" class="qr-cell" :style="{ background: (i*7)%3 ? 'var(--c-ink)' : 'transparent' }"></div>
            </div>
            <div class="lc-meta">
              <div>Giao dịch 02/05/2025</div>
              <div>Ký xác thực điện tử ✓</div>
            </div>
          </div>
        </div>

        <div class="now-playing floating-slow">
          <div class="np-cover"></div>
          <div class="np-body">
            <strong>Đang phát mẫu</strong>
            <span>Nhịp đập Hà Nội · Kai Phạm</span>
            <WaveBars size="xs" :bars="22" variant="solid" :animate="true" class="np-wave" />
          </div>
          <button class="np-play"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>
        </div>

        <div class="badge-secure floating">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
          <div>
            <strong>Hợp đồng số</strong>
            <span>Ký xác thực điện tử</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- LOGO BAR / TRUST -->
  <section class="trust">
    <div class="container">
      <p class="trust-lead">Được tin chọn bởi Creator, nhà phát hành và thương hiệu hàng đầu</p>
      <div class="logos">
        <span v-for="n in ['Skyline', 'Northbeat', 'Lena Music', 'Highland', 'Beatbox', 'Mira Sound']" :key="n">{{ n }}</span>
      </div>
    </div>
  </section>

  <!-- CATEGORIES + GRID -->
  <section id="categories" class="section">
    <div class="container">
      <SectionHead
        class="reveal"
        eyebrow="Thư viện tác quyền"
        title="Khám phá theo thể loại"
        description="Hơn 12.000 tác phẩm đã được xác minh, sẵn sàng giao dịch linh hoạt theo nhu cầu sử dụng."
      >
        <template #actions>
          <button class="btn btn-ghost btn-sm">Bộ lọc nâng cao</button>
          <button class="btn btn-soft btn-sm">Sắp xếp: Phổ biến</button>
        </template>
      </SectionHead>

      <div class="chips reveal">
        <button v-for="c in categories" :key="c.id" :class="['chip', { 'is-active': activeCat === c.id }]" @click="pickCat(c.id)">
          {{ c.label }}
        </button>
      </div>

      <div class="grid">
        <div v-for="(p, i) in filtered" :key="p.id" class="grid-item reveal" :style="{ transitionDelay: (i * 50) + 'ms' }">
          <ProductCard :product="p" />
        </div>
      </div>

      <div v-if="!filtered.length" class="empty reveal">
        Không tìm thấy tác phẩm phù hợp. Thử thay đổi từ khoá hoặc thể loại.
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section id="how" class="section how">
    <div class="container">
      <SectionHead
        class="reveal"
        align="center"
        eyebrow="Quy trình mua tác quyền"
        title="4 bước — từ khám phá đến nhận bàn giao"
        description="Workflow được số hoá toàn bộ, hợp đồng ký xác thực điện tử và lưu vết minh bạch."
      />
      <div class="steps">
        <div v-for="(s, i) in steps" :key="s.n" class="step reveal" :style="{ transitionDelay: (i * 80) + 'ms' }">
          <div class="step-num">{{ s.n }}</div>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
          <div class="step-line" v-if="i < steps.length - 1"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- BENEFITS -->
  <section class="section benefits">
    <div class="container">
      <SectionHead
        class="reveal"
        eyebrow="Vì sao chọn MusicA"
        title="Thương mại điện tử thế hệ mới"
        description="Thiết kế cho nền kinh tế sáng tạo nội dung số — linh hoạt, minh bạch, dễ tiếp cận."
      />
      <div class="bg-grid">
        <div v-for="(b, i) in benefits" :key="i" class="bcard reveal" :style="{ transitionDelay: (i * 80) + 'ms' }">
          <div class="bicon"><span></span></div>
          <h3>{{ b.title }}</h3>
          <p>{{ b.text }}</p>
        </div>
      </div>
    </div>
  </section>

  <section id="use-cases" class="section usecases">
    <div class="container">
      <SectionHead
        class="reveal"
        eyebrow="Use cases"
        title="Dùng cho đúng mục đích — đúng điều khoản"
        description="Từ creator cá nhân đến agency và studio, mọi nhu cầu khai thác đều có cấu hình phù hợp."
      />
      <div class="uc-grid">
        <div v-for="(u, i) in useCases" :key="u.title" class="uc-card reveal" :style="{ transitionDelay: (i * 70) + 'ms' }">
          <h3>{{ u.title }}</h3>
          <p>{{ u.text }}</p>
          <CheckList :items="u.points" />
        </div>
      </div>
    </div>
  </section>

  <!-- ARTISTS -->
  <section id="artists" class="section artists">
    <div class="container">
      <SectionHead class="reveal" eyebrow="Nghệ sĩ tiêu biểu" title="Cộng đồng tác giả đồng hành">
        <template #actions>
          <a href="#" class="link-more">Xem tất cả →</a>
        </template>
      </SectionHead>
      <div class="artist-grid">
        <div v-for="(a, i) in artists" :key="a.id" class="artist-card reveal" :style="{ transitionDelay: (i * 60) + 'ms' }">
          <div class="art-cover" :style="{ background: 'linear-gradient(135deg, hsl(' + (200 + i*18) + ', 75%, 60%), hsl(' + (170 + i*10) + ', 70%, 55%))' }">
            <span class="initial">{{ a.name[0] }}</span>
          </div>
          <h4>{{ a.name }}</h4>
          <p>{{ a.tag }}</p>
          <span class="muted">{{ a.tracks }} tác phẩm</span>
        </div>
      </div>
    </div>
  </section>

  <section id="faq" class="section faq">
    <div class="container">
      <SectionHead
        class="reveal"
        align="center"
        eyebrow="Giải đáp nhanh"
        title="FAQ trước khi bạn giao dịch"
        description="Những câu hỏi phổ biến về pháp lý, nền tảng khai thác và bàn giao tài sản tác quyền."
      />
      <div class="faq-grid">
        <details v-for="(f, i) in faqs" :key="f.q" class="faq-item reveal" :style="{ transitionDelay: (i * 70) + 'ms' }">
          <summary>{{ f.q }}</summary>
          <p>{{ f.a }}</p>
        </details>
      </div>
    </div>
  </section>

  <!-- PRICING / CTA -->
  <section id="pricing" class="section cta">
    <div class="container cta-inner reveal">
      <div class="cta-glow"></div>
      <div class="cta-copy">
        <span class="eyebrow">Sẵn sàng giao dịch?</span>
        <h2>Bắt đầu với gói thử nghiệm <span class="gradient-text">miễn phí</span></h2>
        <p>Tạo tài khoản, thêm tác phẩm đầu tiên vào giỏ và trải nghiệm quy trình ký hợp đồng số chỉ trong vài phút.</p>
        <div class="cta-actions">
          <button class="btn btn-primary btn-lg">Tạo tài khoản miễn phí</button>
          <button class="btn btn-ghost btn-lg">Liên hệ Sales</button>
        </div>
      </div>
      <div class="cta-side">
        <div class="cta-checks">
          <CheckList :items="ctaChecks" />
        </div>
      </div>
    </div>
  </section>
  </div>
</template>

<style scoped>
/* ---------- HERO ---------- */
.hero {
  position: relative;
  overflow: hidden;
  padding: 64px 0 96px;
  background: var(--grad-hero);
  isolation: isolate;
}
.hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 1.16fr) minmax(360px, 0.84fr);
  gap: 44px;
  align-items: center;
}
.hero-copy {
  min-width: 0;
}
.hero-copy h1 {
  font-family: var(--font-display);
  font-size: clamp(32px, 4.4vw, 54px);
  line-height: 1.08;
  letter-spacing: -0.02em;
  margin: 18px 0 18px;
  font-weight: 800;
  text-wrap: balance;
}
.keep-together {
  display: inline-block;
  white-space: nowrap;
}
.hero-copy .lead {
  font-size: 17px;
  line-height: 1.65;
  color: var(--c-text-soft);
  max-width: 620px;
  margin: 0 0 28px;
}
.eyebrow .dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--c-teal-500);
  display: inline-block;
  box-shadow: 0 0 0 4px rgba(20,184,166,0.18);
  animation: pulseRing 2s infinite;
}

.hero-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--c-surface);
  padding: 8px;
  border-radius: var(--radius-full);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-md);
  max-width: 580px;
}
.hero-search .ic { color: var(--c-text-mute); margin-left: 14px; flex-shrink: 0; }
.hero-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  padding: 10px 10px;
  color: var(--c-text);
  font-family: inherit;
}
.hero-search input::placeholder { color: var(--c-text-mute); }

.hero-trust {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  color: var(--c-text-mute);
  font-size: 13px;
  line-height: 1.4;
}
.hero-trust-item {
  background: rgba(255,255,255,0.65);
  border: 1px solid var(--c-border);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-xs);
  color: var(--c-text-soft);
  font-weight: 600;
}
.hero-trust-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--c-border-strong);
}

.hero-suggest {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  align-items: center;
  font-size: 13px;
}
.hero-suggest .hint { color: var(--c-text-mute); }
.hero-suggest a {
  color: var(--c-blue-700);
  background: var(--c-blue-50);
  padding: 5px 10px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background .2s, transform .2s;
}
.hero-suggest a:hover { background: #d6e8ff; transform: translateY(-1px); }

.hero-stats {
  margin-top: 44px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px 24px;
  max-width: 760px;
}
.stat strong {
  display: block;
  font-size: 26px;
  font-weight: 800;
  color: var(--c-text);
  letter-spacing: -0.02em;
}
.stat span {
  color: var(--c-text-mute);
  display: block;
  font-size: 13.5px;
  line-height: 1.45;
  white-space: nowrap;
}

/* Decorative orbs */
.orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.55; z-index: -1; pointer-events: none; }
.orb-a { width: 380px; height: 380px; top: -80px; right: -80px; background: radial-gradient(circle, #5fd9c1, transparent 70%); animation: float 9s ease-in-out infinite; }
.orb-b { width: 320px; height: 320px; bottom: -120px; left: -40px; background: radial-gradient(circle, #6fa9ff, transparent 70%); animation: float 11s ease-in-out infinite reverse; }
.orb-c { width: 260px; height: 260px; top: 30%; right: 35%; background: radial-gradient(circle, #d3e6ff, transparent 70%); animation: float 13s ease-in-out infinite; opacity: 0.45; }

/* Hero art */
.hero-art {
  position: relative;
  min-height: 520px;
}
.floating { animation: float 6s ease-in-out infinite; }
.floating-slow { animation: float 8s ease-in-out infinite; animation-delay: -2s; }

.license-card {
  position: absolute;
  top: 30px;
  right: 0;
  width: min(420px, 96%);
  background: var(--c-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--c-border);
  padding: 22px 22px 18px;
  box-shadow: var(--shadow-lg);
}
.lc-head { display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; }
.lc-tag { color: var(--c-text-mute); letter-spacing: 0.08em; font-weight: 700; }
.lc-status { display: inline-flex; align-items: center; gap: 6px; color: var(--c-teal-600); font-weight: 700; padding: 4px 10px; background: var(--c-teal-50); border-radius: var(--radius-full); }
.lc-status i { width: 6px; height: 6px; border-radius: 50%; background: var(--c-teal-500); box-shadow: 0 0 0 3px rgba(20,184,166,0.2); }
.lc-title { font-size: 20px; font-weight: 800; margin-top: 12px; letter-spacing: -0.01em; }
.lc-sub { color: var(--c-text-mute); font-size: 13px; margin-top: 2px; }
.lc-grid { margin-top: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.lc-grid > div { background: var(--c-bg-soft); border-radius: var(--radius-sm); padding: 10px 12px; }
.lc-grid span { display: block; font-size: 11px; color: var(--c-text-mute); text-transform: uppercase; letter-spacing: 0.08em; }
.lc-grid b { font-size: 13.5px; color: var(--c-text); }
.lc-foot { margin-top: 16px; display: flex; gap: 12px; align-items: center; padding-top: 14px; border-top: 1px dashed var(--c-border); }
.qr { display: grid; grid-template-columns: repeat(6, 8px); grid-auto-rows: 8px; gap: 1px; padding: 4px; background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 6px; }
.qr-cell { width: 8px; height: 8px; }
.lc-meta { font-size: 11.5px; color: var(--c-text-mute); line-height: 1.5; }

.now-playing {
  position: absolute;
  bottom: 36px;
  left: -10px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  width: 280px;
  background: var(--c-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-md);
}
.np-cover { width: 44px; height: 44px; border-radius: 10px; background: var(--grad-brand); }
.np-body { flex: 1; min-width: 0; }
.np-body strong { display: block; font-size: 11px; color: var(--c-text-mute); text-transform: uppercase; letter-spacing: 0.08em; }
.np-body span { display: block; font-size: 13px; font-weight: 600; }
.np-bars { display: flex; gap: 2px; align-items: flex-end; height: 14px; margin-top: 4px; }
.np-bars span { width: 3px; height: 6px; background: var(--c-blue-300); border-radius: 2px; animation: equalizer 1.1s var(--ease-in-out) infinite; }
.np-play {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--grad-brand); color: #fff; border: none;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-sm);
}

.badge-secure {
  position: absolute;
  top: -10px;
  left: 30px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  box-shadow: var(--shadow-sm);
  color: var(--c-teal-600);
}
.badge-secure strong { display: block; font-size: 13px; color: var(--c-text); }
.badge-secure span { font-size: 11.5px; color: var(--c-text-mute); }

/* ---------- TRUST BAR ---------- */
.trust {
  padding: 28px 0;
  border-top: 1px solid var(--c-border);
  border-bottom: 1px solid var(--c-border);
  background: var(--c-surface);
}
.trust-lead { text-align: center; color: var(--c-text-mute); font-size: 12.5px; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 14px; font-weight: 600; }
.logos { display: flex; justify-content: space-around; flex-wrap: wrap; gap: 14px 30px; color: var(--c-text-mute); font-weight: 700; font-size: 18px; letter-spacing: -0.01em; }
.logos span { opacity: 0.55; transition: opacity .25s, color .25s; }
.logos span:hover { opacity: 1; color: var(--c-blue-700); }

.link-more { color: var(--c-blue-700); font-weight: 600; transition: transform .25s; }
.link-more:hover { transform: translateX(4px); }

/* ---------- Chips ---------- */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 28px;
  padding: 12px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-xs);
  width: fit-content;
  max-width: 100%;
}

/* ---------- Grid ---------- */
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
}
@media (max-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 760px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .grid { grid-template-columns: 1fr; } }

.empty { padding: 60px; text-align: center; color: var(--c-text-mute); background: var(--c-bg-soft); border-radius: var(--radius-lg); border: 1px dashed var(--c-border-strong); }

/* ---------- How ---------- */
.how { background: linear-gradient(180deg, var(--c-bg) 0%, var(--c-bg-soft) 100%); }
.steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  position: relative;
}
.step {
  position: relative;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  transition: transform .3s var(--ease-out), box-shadow .3s var(--ease-out), border-color .3s;
}
.step:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--c-border-strong); }
.step-num {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  width: 48px; height: 48px;
  background: var(--grad-brand);
  color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-glow);
  margin-bottom: 18px;
}
.step h3 { margin: 0 0 8px; font-size: 17px; }
.step p { margin: 0; color: var(--c-text-soft); font-size: 14px; line-height: 1.6; }
.step-line {
  position: absolute;
  top: 46px; right: -12px;
  width: 24px; height: 2px;
  background: linear-gradient(90deg, var(--c-blue-300), transparent);
}
@media (max-width: 900px) { .steps { grid-template-columns: 1fr 1fr; } .step-line { display: none; } }
@media (max-width: 520px) { .steps { grid-template-columns: 1fr; } }

/* ---------- Benefits ---------- */
.bg-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.bcard {
  position: relative;
  padding: 28px 22px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform .3s var(--ease-out), box-shadow .3s var(--ease-out);
}
.bcard:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.bcard::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(140% 80% at 100% 0%, rgba(20,184,166,0.10), transparent 60%);
  opacity: 0; transition: opacity .3s;
  pointer-events: none;
}
.bcard:hover::before { opacity: 1; }
.bicon {
  width: 44px; height: 44px; border-radius: 12px;
  background: var(--c-blue-50);
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
  position: relative;
}
.bicon span {
  width: 20px; height: 20px;
  background: var(--grad-brand);
  border-radius: 6px;
  display: block;
}
.bcard h3 { margin: 0 0 6px; font-size: 16px; }
.bcard p { margin: 0; font-size: 13.5px; line-height: 1.6; color: var(--c-text-soft); }
@media (max-width: 900px) { .bg-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 500px) { .bg-grid { grid-template-columns: 1fr; } }

.usecases {
  background: linear-gradient(180deg, var(--c-bg) 0%, var(--c-bg-soft) 100%);
}
.uc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.uc-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding: 22px;
  box-shadow: var(--shadow-xs);
  transition: transform .3s var(--ease-out), box-shadow .3s var(--ease-out), border-color .3s;
}
.uc-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--c-border-strong); }
.uc-card h3 { margin: 0 0 6px; font-size: 16px; }
.uc-card p { margin: 0 0 14px; font-size: 13.5px; line-height: 1.6; color: var(--c-text-soft); }
.uc-card :deep(.checklist) { gap: 6px 14px; }
.uc-card :deep(.checklist li) { padding: 6px 0; }

@media (max-width: 980px) { .uc-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 520px) { .uc-grid { grid-template-columns: 1fr; } }

/* ---------- Artists ---------- */
.artists { background: linear-gradient(180deg, var(--c-bg-soft) 0%, var(--c-bg) 100%); }
.artist-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 18px;
}
.artist-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding: 18px;
  text-align: center;
  transition: transform .3s var(--ease-out), box-shadow .3s var(--ease-out);
}
.artist-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.art-cover {
  width: 70px; height: 70px;
  border-radius: 50%;
  margin: 0 auto 14px;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  font-weight: 800;
  font-size: 24px;
  box-shadow: var(--shadow-sm);
}
.art-cover .initial { transform: translateY(-1px); }
.artist-card h4 { margin: 0; font-size: 14.5px; }
.artist-card p { margin: 2px 0 6px; font-size: 12px; color: var(--c-text-soft); }
.muted { font-size: 11.5px; color: var(--c-text-mute); }
@media (max-width: 980px) { .artist-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 520px) { .artist-grid { grid-template-columns: repeat(2, 1fr); } }

/* ---------- FAQ ---------- */
.faq-grid {
  max-width: 980px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.faq-item {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding: 18px 18px;
  box-shadow: var(--shadow-xs);
  transition: transform .3s var(--ease-out), box-shadow .3s var(--ease-out), border-color .3s;
}
.faq-item:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); border-color: var(--c-border-strong); }
.faq-item[open] { box-shadow: var(--shadow-sm); border-color: var(--c-blue-100); }
.faq-item summary {
  list-style: none;
  cursor: pointer;
  font-weight: 700;
  color: var(--c-text);
  letter-spacing: -0.01em;
}
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary:focus-visible {
  outline: 3px solid rgba(31,109,240,0.25);
  outline-offset: 4px;
  border-radius: 12px;
}
.faq-item p {
  margin: 10px 0 0;
  color: var(--c-text-soft);
  line-height: 1.65;
  font-size: 14px;
}
@media (max-width: 760px) { .faq-grid { grid-template-columns: 1fr; } }

/* ---------- CTA ---------- */
.cta { padding-bottom: 0; }
.cta-inner {
  position: relative;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 36px;
  align-items: center;
  background: var(--grad-cta);
  color: #fff;
  border-radius: var(--radius-xl);
  padding: 56px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}
.cta-glow {
  position: absolute; inset: 0;
  background: radial-gradient(600px 300px at 20% 30%, rgba(95,217,193,0.35), transparent 60%),
              radial-gradient(500px 280px at 90% 80%, rgba(111,169,255,0.30), transparent 60%);
  pointer-events: none;
}
.cta-copy { position: relative; }
.cta-copy .eyebrow { background: rgba(255,255,255,0.12); color: #d6f7f0; border-color: rgba(255,255,255,0.2); }
.cta-copy h2 { margin: 14px 0 10px; font-size: clamp(26px, 3.4vw, 38px); letter-spacing: -0.02em; color: #fff; }
.cta-copy h2 .gradient-text { background: var(--grad-brand); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.cta-copy p { color: rgba(255,255,255,0.78); max-width: 520px; line-height: 1.65; margin: 0 0 24px; }
.cta-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.cta-actions .btn-ghost { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.25); }
.cta-actions .btn-ghost:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.5); color: #fff; }

.cta-side { position: relative; }
.cta-checks {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: var(--radius-lg);
  padding: 22px;
  backdrop-filter: blur(8px);
}
.cta-checks :deep(.checklist) { grid-template-columns: 1fr; gap: 6px; }
.cta-checks :deep(.checklist li) { padding: 10px 0; border-bottom: 1px dashed rgba(255,255,255,0.15); }
.cta-checks :deep(.checklist li:last-child) { border-bottom: none; }
.cta-checks :deep(.tick) { background: rgba(20,184,166,0.18); color: #d6f7f0; border-color: rgba(20,184,166,0.35); }
.cta-checks :deep(.body strong) { color: #fff; font-weight: 600; }
.cta-checks :deep(.body span) { color: rgba(255,255,255,0.75); }
@media (max-width: 900px) {
  .cta-inner { grid-template-columns: 1fr; padding: 36px; }
}

/* ---------- Hero responsive ---------- */
@media (max-width: 980px) {
  .hero-inner { grid-template-columns: 1fr; gap: 40px; }
  .hero-art { min-height: 460px; }
  .hero-copy .lead { max-width: 700px; }
  .hero-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); max-width: 820px; }
}
@media (max-width: 640px) {
  .hero { padding: 28px 0 60px; }
  .hero-copy h1 { font-size: 32px; line-height: 1.1; }
  .hero-copy .lead { font-size: 15px; }
  .hero-stats { grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 28px; }
  .stat strong { font-size: 22px; }
  .stat span { white-space: normal; }
  .hero-search { padding: 6px; flex-wrap: wrap; }
  .hero-search input { font-size: 14px; min-width: 0; }
  .hero-search .btn { width: 100%; margin-top: 4px; }
  .hero-search .ic { margin-left: 10px; }
  .license-card { padding: 18px; position: relative; top: 0; width: 100%; }
  .badge-secure { left: 10px; position: relative; top: 0; margin-bottom: 14px; display: inline-flex; }
  .now-playing { left: 0; right: 0; width: 100%; position: relative; bottom: 0; margin-top: 14px; }
  .hero-art { min-height: auto; display: flex; flex-direction: column; gap: 14px; align-items: stretch; }
  .floating, .floating-slow { animation: none; }
  .section { padding: 56px 0; }
  .section-head { flex-direction: column; align-items: flex-start; }
  .head-actions { width: 100%; }
  .head-actions .btn { flex: 1; }
  .cta-inner { padding: 28px 20px; }
}
</style>
