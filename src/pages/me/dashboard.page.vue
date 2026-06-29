<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import MeAccountLayout from '../../components/features/me/MeAccountLayout.vue'
import HintIcon from '../../shared/ui/HintIcon.vue'
import { useAuthStore } from '../../modules/auth/auth.store'
import { canAccessArtistArea } from '../../modules/auth/auth.capabilities'
import { getMyOnboarding } from '../../modules/artist-onboarding/api'
import { useArtistTour } from '../../composables/useArtistTour'

const auth = useAuthStore()
const { startTour } = useArtistTour()

onMounted(async () => {
  if (auth.isAuthenticated && canAccessArtistArea(auth.roles)) {
    try {
      const { data } = await getMyOnboarding()
      if (data.status === 'NOT_STARTED') {
        setTimeout(() => startTour(), 800)
      }
    } catch {
      // Không block nếu API lỗi
    }
  }
})

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
)

// ── Period selector ──────────────────────────────────────────────────────────
type Period = '7d' | '30d' | '6m' | '12m'
const period = ref<Period>('30d')
const periodOptions: { value: Period; label: string }[] = [
  { value: '7d',  label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '6m',  label: '6 tháng' },
  { value: '12m', label: '12 tháng' },
]

// ── Mock data per period ─────────────────────────────────────────────────────
const mockData: Record<Period, {
  labels: string[]
  revenue: number[]
  purchases: number[]
  plays: number[]
}> = {
  '7d': {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    revenue:   [120000, 85000, 210000, 175000, 320000, 265000, 190000],
    purchases: [2, 1, 4, 3, 6, 5, 3],
    plays:     [34, 27, 58, 45, 89, 72, 51],
  },
  '30d': {
    labels: ['01/6','05/6','10/6','15/6','20/6','25/6','30/6'],
    revenue:   [420000, 680000, 530000, 910000, 740000, 1200000, 870000],
    purchases: [8, 13, 10, 18, 14, 24, 16],
    plays:     [210, 320, 280, 450, 390, 610, 420],
  },
  '6m': {
    labels: ['Th.1','Th.2','Th.3','Th.4','Th.5','Th.6'],
    revenue:   [3200000, 4100000, 2900000, 5600000, 4800000, 6200000],
    purchases: [62, 80, 55, 110, 92, 121],
    plays:     [1800, 2400, 1650, 3200, 2800, 3900],
  },
  '12m': {
    labels: ['T7','T8','T9','T10','T11','T12','T1','T2','T3','T4','T5','T6'],
    revenue:   [2100000,2800000,3500000,2900000,4200000,5100000,3800000,4600000,5400000,4900000,6100000,7200000],
    purchases: [40,55,68,52,83,99,72,90,104,95,118,140],
    plays:     [1100,1500,1900,1600,2300,2900,2100,2600,3100,2800,3500,4200],
  },
}

const current = computed(() => mockData[period.value])

// ── KPI cards ────────────────────────────────────────────────────────────────
const kpiCards = computed(() => {
  const d = current.value
  const totalRevenue   = d.revenue.reduce((a, b) => a + b, 0)
  const totalPurchases = d.purchases.reduce((a, b) => a + b, 0)
  const totalPlays     = d.plays.reduce((a, b) => a + b, 0)
  const avgRevenue     = Math.round(totalRevenue / totalPurchases) || 0
  return [
    { label: 'Doanh thu', value: formatVND(totalRevenue),  icon: 'pi pi-wallet',    color: 'blue',  delta: '+12%' },
    { label: 'Lượt mua',  value: totalPurchases.toString(), icon: 'pi pi-shopping-cart', color: 'teal', delta: '+8%' },
    { label: 'Lượt nghe', value: totalPlays.toString(),    icon: 'pi pi-headphones', color: 'indigo', delta: '+21%' },
    { label: 'Trung bình/đơn', value: formatVND(avgRevenue), icon: 'pi pi-chart-line', color: 'green', delta: '+5%' },
  ]
})

function formatVND(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'tr ₫'
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'k ₫'
  return n + ' ₫'
}

// ── Chart: Revenue line ───────────────────────────────────────────────────────
const revenueChartData = computed(() => ({
  labels: current.value.labels,
  datasets: [{
    label: 'Doanh thu (₫)',
    data: current.value.revenue,
    fill: true,
    borderColor: '#1f6df0',
    backgroundColor: 'rgba(31,109,240,0.10)',
    pointBackgroundColor: '#1f6df0',
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
    pointRadius: 5,
    pointHoverRadius: 7,
    tension: 0.4,
    borderWidth: 2.5,
  }],
}))

const revenueChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0c1e33',
      titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: '700', size: 12 },
      bodyFont:  { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
      padding: 12,
      cornerRadius: 10,
      callbacks: {
        label: (ctx: any) => '  ' + ctx.parsed.y.toLocaleString('vi-VN') + ' ₫',
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }, color: '#7c8da3' },
      border: { display: false },
    },
    y: {
      grid: { color: '#e3edf6' },
      ticks: {
        font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
        color: '#7c8da3',
        callback: (v: any) => formatVND(v),
      },
      border: { display: false },
    },
  },
}))

// ── Chart: Purchases bar ──────────────────────────────────────────────────────
const purchasesChartData = computed(() => ({
  labels: current.value.labels,
  datasets: [{
    label: 'Lượt mua',
    data: current.value.purchases,
    backgroundColor: 'rgba(20,184,166,0.75)',
    hoverBackgroundColor: '#14b8a6',
    borderRadius: 8,
    borderSkipped: false,
  }],
}))

const purchasesChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0c1e33',
      titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: '700', size: 12 },
      bodyFont:  { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
      padding: 12,
      cornerRadius: 10,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }, color: '#7c8da3' },
      border: { display: false },
    },
    y: {
      grid: { color: '#e3edf6' },
      ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }, color: '#7c8da3', stepSize: 1 },
      border: { display: false },
      beginAtZero: true,
    },
  },
}))

// ── Chart: Plays line ─────────────────────────────────────────────────────────
const playsChartData = computed(() => ({
  labels: current.value.labels,
  datasets: [{
    label: 'Lượt nghe',
    data: current.value.plays,
    fill: true,
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99,102,241,0.10)',
    pointBackgroundColor: '#6366f1',
    pointBorderColor: '#fff',
    pointBorderWidth: 2,
    pointRadius: 5,
    pointHoverRadius: 7,
    tension: 0.4,
    borderWidth: 2.5,
  }],
}))

// ── Chart: Genre doughnut ─────────────────────────────────────────────────────
const genreChartData = {
  labels: ['Pop', 'Electronic', 'Hip-Hop', 'Jazz', 'Rock', 'Khác'],
  datasets: [{
    data: [32, 24, 18, 11, 9, 6],
    backgroundColor: ['#1f6df0','#14b8a6','#6366f1','#f59e0b','#ef4444','#e3edf6'],
    hoverBackgroundColor: ['#1456cf','#0e9489','#4f46e5','#d97706','#dc2626','#cfdfee'],
    borderWidth: 0,
    hoverOffset: 6,
  }],
}
const genreChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
        color: '#455a73',
        padding: 14,
        usePointStyle: true,
        pointStyleWidth: 10,
      },
    },
    tooltip: {
      backgroundColor: '#0c1e33',
      titleFont: { family: "'Plus Jakarta Sans', sans-serif", weight: '700', size: 12 },
      bodyFont:  { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
      padding: 12,
      cornerRadius: 10,
      callbacks: { label: (ctx: any) => `  ${ctx.label}: ${ctx.parsed}%` },
    },
  },
}

// ── Top products mock ─────────────────────────────────────────────────────────
const topProducts = [
  { rank: 1, title: 'Summer Vibes Beat',   genre: 'Pop',        purchases: 47, revenue: 2820000 },
  { rank: 2, title: 'Midnight Flow',        genre: 'Hip-Hop',    purchases: 38, revenue: 2280000 },
  { rank: 3, title: 'Neon City',            genre: 'Electronic', purchases: 29, revenue: 1740000 },
  { rank: 4, title: 'Acoustic Morning',     genre: 'Folk',       purchases: 21, revenue: 1260000 },
  { rank: 5, title: 'Deep Jazz Session',    genre: 'Jazz',       purchases: 16, revenue:  960000 },
]
</script>

<template>
  <MeAccountLayout active="dashboard">
    <div class="dash-root">

      <!-- Header row -->
      <div class="dash-header">
        <div>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="dash-title">Dashboard</div>
            <HintIcon
              placement="right"
              content="Tổng quan hiệu suất tài khoản của bạn. Chọn khoảng thời gian ở góc phải để xem số liệu theo 7 ngày, 30 ngày, 6 tháng hoặc 12 tháng. Dữ liệu hiện tại là dữ liệu minh hoạ."
            />
          </div>
          <div class="dash-sub">Tổng quan hoạt động của bạn</div>
        </div>
        <div class="period-tabs">
          <button
            v-for="opt in periodOptions"
            :key="opt.value"
            :class="['period-btn', { active: period === opt.value }]"
            @click="period = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div v-for="card in kpiCards" :key="card.label" class="kpi-card" :class="`kpi-${card.color}`">
          <div class="kpi-icon-wrap">
            <i :class="card.icon"></i>
          </div>
          <div class="kpi-body">
            <div class="kpi-label">{{ card.label }}</div>
            <div class="kpi-value">{{ card.value }}</div>
          </div>
          <div class="kpi-delta">
            <i class="pi pi-arrow-up-right"></i>{{ card.delta }}
          </div>
        </div>
      </div>

      <!-- Revenue + Purchases row -->
      <div class="charts-row-2">
        <div class="chart-card chart-card--wide">
          <div class="chart-header">
            <div style="display:flex;align-items:flex-start;gap:8px;">
              <div>
                <div class="chart-title">Doanh thu theo thời gian</div>
                <div class="chart-sub">Tổng doanh thu từ bán nhạc</div>
              </div>
              <HintIcon
                placement="top"
                content="Biểu đồ đường thể hiện tổng doanh thu (VNĐ) bạn nhận được từ các giao dịch mua bán tác quyền. Doanh thu được tính sau khi trừ phí nền tảng."
              />
            </div>
            <div class="chart-badge chart-badge--blue">₫</div>
          </div>
          <div class="chart-body">
            <Line :data="revenueChartData" :options="revenueChartOptions as any" />
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <div style="display:flex;align-items:flex-start;gap:8px;">
              <div>
                <div class="chart-title">Lượt mua</div>
                <div class="chart-sub">Số lần bán ra trong kỳ</div>
              </div>
              <HintIcon
                placement="top"
                content="Mỗi cột đại diện cho số đơn hàng thành công trong ngày/tháng đó. Một lượt mua = một người đã cấp phép và thanh toán thành công cho tác phẩm của bạn."
              />
            </div>
            <div class="chart-badge chart-badge--teal">
              <i class="pi pi-shopping-cart"></i>
            </div>
          </div>
          <div class="chart-body">
            <Bar :data="purchasesChartData" :options="purchasesChartOptions as any" />
          </div>
        </div>
      </div>

      <!-- Plays + Genre row -->
      <div class="charts-row-2">
        <div class="chart-card chart-card--wide">
          <div class="chart-header">
            <div style="display:flex;align-items:flex-start;gap:8px;">
              <div>
                <div class="chart-title">Lượt nghe theo thời gian</div>
                <div class="chart-sub">Xu hướng lượt phát nhạc</div>
              </div>
              <HintIcon
                placement="top"
                content="Số lần bản nhạc của bạn được phát thử (preview) trên trang chợ. Lượt nghe cao cho thấy tác phẩm đang thu hút sự chú ý — nhưng chưa chắc đã chuyển thành đơn mua."
              />
            </div>
            <div class="chart-badge chart-badge--indigo">
              <i class="pi pi-headphones"></i>
            </div>
          </div>
          <div class="chart-body">
            <Line :data="playsChartData" :options="revenueChartOptions as any" />
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <div style="display:flex;align-items:flex-start;gap:8px;">
              <div>
                <div class="chart-title">Phân bổ thể loại</div>
                <div class="chart-sub">% doanh thu theo genre</div>
              </div>
              <HintIcon
                placement="top"
                content="Biểu đồ tròn cho thấy thể loại nào đang mang lại doanh thu nhiều nhất. Dùng thông tin này để tập trung sản xuất nhạc ở các thể loại có nhu cầu cao."
              />
            </div>
            <div class="chart-badge chart-badge--purple">
              <i class="pi pi-chart-pie"></i>
            </div>
          </div>
          <div class="chart-body chart-body--doughnut">
            <Doughnut :data="genreChartData" :options="genreChartOptions as any" />
          </div>
        </div>
      </div>

      <!-- Top products table -->
      <div class="chart-card">
        <div class="chart-header">
          <div style="display:flex;align-items:flex-start;gap:8px;">
            <div>
              <div class="chart-title">Top sản phẩm bán chạy</div>
              <div class="chart-sub">Xếp hạng theo doanh thu trong kỳ</div>
            </div>
            <HintIcon
              placement="right"
              content="5 tác phẩm có doanh thu cao nhất trong kỳ được chọn. Nếu một bản nhạc liên tục nằm top — đó là tín hiệu để bạn tạo thêm nhạc theo phong cách tương tự."
            />
          </div>
          <div class="chart-badge chart-badge--gold">
            <i class="pi pi-trophy"></i>
          </div>
        </div>
        <div class="top-table">
          <div class="top-table-head">
            <span>#</span>
            <span>Tên bản nhạc</span>
            <span>Thể loại</span>
            <span class="text-right">Lượt mua</span>
            <span class="text-right">Doanh thu</span>
          </div>
          <div v-for="p in topProducts" :key="p.rank" class="top-table-row">
            <span class="rank-badge" :class="`rank-${p.rank}`">{{ p.rank }}</span>
            <span class="product-title">{{ p.title }}</span>
            <span class="genre-chip">{{ p.genre }}</span>
            <span class="text-right num-value">{{ p.purchases }}</span>
            <span class="text-right num-value revenue">{{ (p.revenue / 1_000_000).toFixed(2) }}tr ₫</span>
          </div>
        </div>
      </div>

    </div>
  </MeAccountLayout>
</template>

<style scoped>
.dash-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header */
.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.dash-title {
  font-size: 20px;
  font-weight: 900;
  color: var(--c-text);
  line-height: 1.2;
}
.dash-sub {
  font-size: 13px;
  color: var(--c-text-mute);
  font-weight: 500;
  margin-top: 2px;
}

/* Period tabs */
.period-tabs {
  display: flex;
  gap: 4px;
  background: var(--c-bg-mute);
  padding: 4px;
  border-radius: var(--radius-full);
}
.period-btn {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  border: none;
  background: transparent;
  color: var(--c-text-mute);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: background .18s, color .18s, box-shadow .18s;
  font-family: inherit;
  white-space: nowrap;
}
.period-btn:hover { color: var(--c-text); }
.period-btn.active {
  background: #fff;
  color: var(--c-blue-700);
  box-shadow: var(--shadow-xs);
}

/* KPI cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.kpi-card {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-xs);
  transition: box-shadow .2s, transform .2s;
  position: relative;
  overflow: hidden;
}
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}
.kpi-blue::before  { background: var(--grad-brand); }
.kpi-teal::before  { background: linear-gradient(90deg, #14b8a6, #2aa7d8); }
.kpi-indigo::before { background: linear-gradient(90deg, #6366f1, #a78bfa); }
.kpi-green::before { background: linear-gradient(90deg, #22c55e, #14b8a6); }
.kpi-card:hover { box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.kpi-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.kpi-blue .kpi-icon-wrap  { background: var(--c-blue-50);  color: var(--c-blue-600); }
.kpi-teal .kpi-icon-wrap  { background: var(--c-teal-50);  color: var(--c-teal-600); }
.kpi-indigo .kpi-icon-wrap { background: #eef2ff; color: #6366f1; }
.kpi-green .kpi-icon-wrap { background: #f0fdf4; color: #22c55e; }
.kpi-body { flex: 1; min-width: 0; }
.kpi-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--c-text-mute);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.kpi-value {
  font-size: 18px;
  font-weight: 900;
  color: var(--c-text);
  margin-top: 2px;
  white-space: nowrap;
}
.kpi-delta {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 700;
  color: #22c55e;
  white-space: nowrap;
  align-self: flex-start;
  margin-top: 2px;
}
.kpi-delta .pi { font-size: 10px; }

/* Chart layout */
.charts-row-2 {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 14px;
}
.chart-card {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: var(--shadow-xs);
}
.chart-card--wide { /* used via grid */ }

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}
.chart-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--c-text);
}
.chart-sub {
  font-size: 12px;
  color: var(--c-text-mute);
  margin-top: 3px;
}
.chart-badge {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
  flex-shrink: 0;
}
.chart-badge--blue   { background: var(--c-blue-50); color: var(--c-blue-600); border: 1px solid var(--c-blue-100); }
.chart-badge--teal   { background: var(--c-teal-50); color: var(--c-teal-600); border: 1px solid rgba(20,184,166,.2); }
.chart-badge--indigo { background: #eef2ff; color: #6366f1; border: 1px solid #e0e7ff; }
.chart-badge--purple { background: #faf5ff; color: #9333ea; border: 1px solid #f3e8ff; }
.chart-badge--gold   { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }

.chart-body {
  height: 220px;
  position: relative;
}
.chart-body--doughnut {
  height: 260px;
}

/* Top products table */
.top-table {
  margin-top: 4px;
}
.top-table-head {
  display: grid;
  grid-template-columns: 36px 1fr 120px 90px 110px;
  gap: 8px;
  padding: 8px 10px;
  font-size: 11px;
  font-weight: 800;
  color: var(--c-text-mute);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--c-border);
  margin-bottom: 4px;
}
.top-table-row {
  display: grid;
  grid-template-columns: 36px 1fr 120px 90px 110px;
  gap: 8px;
  align-items: center;
  padding: 10px 10px;
  border-radius: var(--radius-xs);
  transition: background .15s;
}
.top-table-row:hover { background: var(--c-bg-soft); }

.rank-badge {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  background: var(--c-bg-mute);
  color: var(--c-text-mute);
}
.rank-1 { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #fff; }
.rank-2 { background: linear-gradient(135deg, #d1d5db, #9ca3af); color: #fff; }
.rank-3 { background: linear-gradient(135deg, #fb923c, #ea580c); color: #fff; }

.product-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.genre-chip {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  background: var(--c-blue-50);
  color: var(--c-blue-700);
  font-size: 11px;
  font-weight: 700;
  border: 1px solid var(--c-blue-100);
}
.num-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text-soft);
  text-align: right;
}
.num-value.revenue { color: var(--c-blue-600); }
.text-right { text-align: right; }

/* Responsive */
@media (max-width: 1100px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-row-2 { grid-template-columns: 1fr; }
  .top-table-head,
  .top-table-row { grid-template-columns: 36px 1fr 100px 80px 100px; }
}
@media (max-width: 640px) {
  .kpi-grid { grid-template-columns: 1fr 1fr; }
  .kpi-value { font-size: 15px; }
  .dash-header { flex-direction: column; align-items: flex-start; }
}
</style>
