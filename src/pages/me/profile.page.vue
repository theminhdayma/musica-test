<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import MeAccountLayout from '../../components/features/me/MeAccountLayout.vue'
import HintIcon from '../../shared/ui/HintIcon.vue'
import type { ArtistProfile, MeProfile } from '../../modules/auth/types'
import { getMeApi } from '../../modules/auth/auth.api'
import { ApiError } from '../../shared/api/errors'

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const me = ref<MeProfile | null>(null)
const artistProfile = ref<ArtistProfile | null>(null)

const avatarLetter = computed(() => {
  const name = artistProfile.value?.stageName || me.value?.user?.fullName || me.value?.user?.email || '?'
  return name.charAt(0).toUpperCase()
})

const genreLabel = computed(() => {
  const map: Record<string, string> = {
    POP: 'Pop', ELECTRONIC: 'Electronic', HIP_HOP: 'Hip-Hop',
    ROCK: 'Rock', JAZZ: 'Jazz', CLASSICAL: 'Classical',
    FOLK: 'Folk', RNB: 'R&B', EDM: 'EDM'
  }
  const g = artistProfile.value?.primaryGenre
  return g ? (map[g] ?? g) : null
})

const countryFlag = computed(() => {
  const code = artistProfile.value?.countryCode?.toUpperCase()
  if (!code || code.length !== 2) return null
  return code.split('').map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('')
})

const statusColor = computed(() => {
  const s = me.value?.user?.status
  if (s === 'ACTIVE') return 'active'
  if (s === 'INACTIVE') return 'inactive'
  return 'pending'
})

const statusLabel = computed(() => {
  const s = me.value?.user?.status
  if (s === 'ACTIVE') return 'Đang hoạt động'
  if (s === 'INACTIVE') return 'Không hoạt động'
  return s || '—'
})

async function fetchMe() {
  loading.value = true
  errorMessage.value = null
  try {
    const res = await getMeApi()
    me.value = res.data
    const profile = res.data.profile
    artistProfile.value = profile && 'stageName' in profile ? (profile as ArtistProfile) : null
  } catch (error) {
    if (error instanceof ApiError) {
      errorMessage.value = error.message
    } else if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Không thể tải thông tin tài khoản.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void fetchMe()
})
</script>

<template>
  <MeAccountLayout active="profile">
    <div class="profile-root">

      <div v-if="loading" class="profile-loading">
        <div class="loading-spinner"></div>
        <span>Đang tải hồ sơ...</span>
      </div>

      <div v-else-if="errorMessage" class="profile-error">
        <i class="pi pi-exclamation-triangle"></i>
        {{ errorMessage }}
      </div>

      <template v-else-if="me">
        <!-- Hero Banner -->
        <div class="profile-hero">
          <div class="hero-cover"></div>
          <div class="hero-body">
            <div class="hero-avatar">
              <span class="avatar-letter">{{ avatarLetter }}</span>
              <span class="avatar-status-dot" :class="statusColor"></span>
            </div>
            <div class="hero-info">
              <div class="hero-stage-name">
                {{ artistProfile?.stageName || me.user.fullName || '—' }}
              </div>
              <div class="hero-meta-row">
                <span v-if="genreLabel" class="hero-genre-badge">
                  <i class="pi pi-music"></i>
                  {{ genreLabel }}
                </span>
                <span v-if="countryFlag" class="hero-country">
                  {{ countryFlag }} {{ artistProfile?.countryCode?.toUpperCase() }}
                </span>
                <span class="hero-role-badge">
                  <i class="pi pi-star-fill"></i>
                  Nghệ sĩ
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bio -->
        <div v-if="artistProfile?.bio" class="profile-bio-card">
          <div class="section-eyebrow">
            <i class="pi pi-align-left"></i> Tiểu sử
          </div>
          <p class="bio-text">{{ artistProfile.bio }}</p>
        </div>

        <!-- Info Grid -->
        <div class="profile-grid">
          <!-- Account Info -->
          <div class="profile-card">
            <div class="card-header">
              <div class="card-icon card-icon--blue">
                <i class="pi pi-user"></i>
              </div>
              <div class="card-title">Thông tin tài khoản</div>
              <HintIcon
                placement="top"
                content="Thông tin tài khoản cơ bản của bạn. Để thay đổi email hoặc số điện thoại, liên hệ bộ phận hỗ trợ. Trạng thái tài khoản cần là 'Đang hoạt động' để sản phẩm được xuất bản."
              />
            </div>
            <div class="info-list">
              <div class="info-item">
                <span class="info-icon"><i class="pi pi-id-card"></i></span>
                <div class="info-content">
                  <div class="info-label">Họ và tên</div>
                  <div class="info-value">{{ me.user.fullName || '—' }}</div>
                </div>
              </div>
              <div class="info-item">
                <span class="info-icon"><i class="pi pi-envelope"></i></span>
                <div class="info-content">
                  <div class="info-label">Email</div>
                  <div class="info-value">{{ me.user.email }}</div>
                </div>
              </div>
              <div class="info-item">
                <span class="info-icon"><i class="pi pi-phone"></i></span>
                <div class="info-content">
                  <div class="info-label">Số điện thoại</div>
                  <div class="info-value">{{ me.user.phoneNumber || '—' }}</div>
                </div>
              </div>
              <div class="info-item">
                <span class="info-icon"><i class="pi pi-shield"></i></span>
                <div class="info-content">
                  <div class="info-label" style="display:inline-flex;align-items:center;gap:6px;">
                    Trạng thái
                    <HintIcon
                      placement="right"
                      content="• Đang hoạt động: Tài khoản hợp lệ, sản phẩm có thể được duyệt và xuất bản lên chợ.&#10;• Không hoạt động: Tài khoản bị tạm khóa, sản phẩm sẽ bị ẩn khỏi chợ.&#10;Liên hệ hỗ trợ nếu trạng thái không đúng."
                    />
                  </div>
                  <div class="info-value">
                    <span class="status-badge" :class="statusColor">{{ statusLabel }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Artist Profile -->
          <div class="profile-card">
            <div class="card-header">
              <div class="card-icon card-icon--teal">
                <i class="pi pi-star"></i>
              </div>
              <div class="card-title">Hồ sơ nghệ sĩ</div>
              <HintIcon
                placement="top"
                content="Hồ sơ nghệ sĩ là thông tin hiển thị công khai trên trang chợ. Tên nghệ danh, thể loại chính và tiểu sử giúp người mua nhận diện và tin tưởng bạn hơn. Hoàn thiện hồ sơ để tăng tỷ lệ chuyển đổi."
              />
            </div>
            <div v-if="!artistProfile" class="no-profile">
              <i class="pi pi-info-circle"></i>
              <span>Chưa có hồ sơ nghệ sĩ</span>
            </div>
            <div v-else class="info-list">
              <div class="info-item">
                <span class="info-icon"><i class="pi pi-microphone"></i></span>
                <div class="info-content">
                  <div class="info-label">Tên nghệ danh</div>
                  <div class="info-value highlight">{{ artistProfile.stageName || '—' }}</div>
                </div>
              </div>
              <div class="info-item">
                <span class="info-icon"><i class="pi pi-music"></i></span>
                <div class="info-content">
                  <div class="info-label">Thể loại chính</div>
                  <div class="info-value">
                    <span v-if="genreLabel" class="genre-pill">{{ genreLabel }}</span>
                    <span v-else>—</span>
                  </div>
                </div>
              </div>
              <div class="info-item">
                <span class="info-icon"><i class="pi pi-globe"></i></span>
                <div class="info-content">
                  <div class="info-label">Quốc gia</div>
                  <div class="info-value">
                    <template v-if="artistProfile.countryCode">
                      {{ countryFlag }} {{ artistProfile.countryCode.toUpperCase() }}
                    </template>
                    <template v-else>—</template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

    </div>
  </MeAccountLayout>
</template>

<style scoped>
.profile-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  color: var(--c-text-mute);
  font-weight: 600;
}
.loading-spinner {
  width: 22px;
  height: 22px;
  border: 3px solid var(--c-blue-100);
  border-top-color: var(--c-blue-500);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.profile-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px;
  background: #fff1f0;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  color: #b42318;
  font-weight: 700;
}

/* Hero */
.profile-hero {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-sm);
}
.hero-cover {
  height: 130px;
  background: var(--grad-brand);
  position: relative;
}
.hero-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.12) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%);
}
.hero-body {
  display: flex;
  align-items: flex-end;
  gap: 18px;
  padding: 0 24px 22px;
  margin-top: -46px;
}
.hero-avatar {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: var(--grad-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #fff;
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
  position: relative;
}
.avatar-letter {
  font-size: 32px;
  font-weight: 900;
  color: #fff;
  line-height: 1;
}
.avatar-status-dot {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
}
.avatar-status-dot.active { background: #22c55e; }
.avatar-status-dot.inactive { background: #ef4444; }
.avatar-status-dot.pending { background: #f59e0b; }

.hero-info {
  padding-bottom: 2px;
  flex: 1;
  min-width: 0;
}
.hero-stage-name {
  font-size: 22px;
  font-weight: 900;
  color: var(--c-text);
  line-height: 1.2;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hero-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.hero-genre-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: var(--c-blue-50);
  border: 1px solid var(--c-blue-100);
  color: var(--c-blue-600);
  font-size: 11px;
  font-weight: 700;
}
.hero-genre-badge .pi { font-size: 10px; }
.hero-country {
  font-size: 12px;
  font-weight: 700;
  color: var(--c-text-mute);
}
.hero-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: var(--c-teal-50);
  border: 1px solid rgba(20,184,166,0.25);
  color: var(--c-teal-600);
  font-size: 11px;
  font-weight: 700;
}
.hero-role-badge .pi { font-size: 10px; }

/* Bio */
.profile-bio-card {
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: 18px 22px;
}
.section-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 800;
  color: var(--c-teal-600);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.bio-text {
  font-size: 14px;
  color: var(--c-text-soft);
  line-height: 1.7;
  white-space: pre-wrap;
  margin: 0;
}

/* Grid */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.profile-card {
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: var(--shadow-xs);
  transition: box-shadow .25s var(--ease-out), border-color .25s;
}
.profile-card:hover {
  box-shadow: var(--shadow-sm);
  border-color: var(--c-border-strong);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--c-border);
}
.card-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}
.card-icon--blue {
  background: var(--c-blue-50);
  color: var(--c-blue-600);
  border: 1px solid var(--c-blue-100);
}
.card-icon--teal {
  background: var(--c-teal-50);
  color: var(--c-teal-600);
  border: 1px solid rgba(20,184,166,0.2);
}
.card-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--c-text);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.info-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-xs);
  background: var(--c-bg-mute);
  border: 1px solid var(--c-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-blue-500);
  font-size: 13px;
  flex-shrink: 0;
}
.info-content { flex: 1; min-width: 0; }
.info-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--c-text-mute);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.info-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.info-value.highlight {
  font-size: 15px;
  font-weight: 800;
  color: var(--c-text);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
}
.status-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}
.status-badge.active { background: #ecfdf5; color: #065f46; border: 1px solid #bbf7d0; }
.status-badge.active::before { background: #22c55e; }
.status-badge.inactive { background: #fff1f0; color: #b42318; border: 1px solid #fecaca; }
.status-badge.inactive::before { background: #ef4444; }
.status-badge.pending { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
.status-badge.pending::before { background: #f59e0b; }

.genre-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  background: var(--c-teal-50);
  border: 1px solid rgba(20,184,166,0.25);
  color: var(--c-teal-600);
  font-size: 12px;
  font-weight: 700;
}

.no-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 24px;
  color: var(--c-text-mute);
  font-weight: 600;
  font-size: 13px;
}
.no-profile .pi { font-size: 22px; }

@media (max-width: 720px) {
  .profile-grid { grid-template-columns: 1fr; }
  .hero-stage-name { font-size: 18px; }
}
</style>
