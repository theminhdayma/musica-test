<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../modules/auth/auth.store'
import { getAuthErrorMessage } from '../../modules/auth/auth.messages'
import { getDefaultAuthenticatedRoute } from '../../modules/auth/auth.routing'
import type { ClientRole } from '../../modules/auth/types'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const token = computed(() => (route.query.token as string) || '')
const email = computed(() => (route.query.email as string) || auth.pendingOtpChallenge?.email || '')
const role = computed<ClientRole>(() => {
  if (route.query.role === 'ARTIST') return 'ARTIST'
  if (route.query.role === 'BUYER') return 'BUYER'
  if (auth.pendingOtpChallenge?.purpose === 'signup_artist') return 'ARTIST'
  return 'BUYER'
})

const fullName = ref('')
const password = ref('')
const confirmPassword = ref('')
const submitting = ref(false)
const errorMessage = ref<string | null>(null)

async function handleComplete() {
  if (!fullName.value.trim() || !password.value) return
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp.'
    return
  }

  errorMessage.value = null
  submitting.value = true
  try {
    if (role.value === 'ARTIST') {
      await auth.registerArtist({
        email: email.value,
        fullName: fullName.value.trim(),
        password: password.value,
        verificationToken: token.value
      })
    } else {
      await auth.registerBuyer({
        email: email.value,
        fullName: fullName.value.trim(),
        password: password.value,
        verificationToken: token.value
      })
    }

    router.push(getDefaultAuthenticatedRoute(auth.roles, role.value))
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error, 'Không thể hoàn tất đăng ký.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-background text-on-surface font-body-md text-sm flex flex-col w-full">
    <!-- Upper Content Area: Split layout -->
    <div class="flex-grow flex flex-col md:flex-row w-full">
      <!-- Left Side: Hero Image -->
      <div class="w-full md:w-1/2 relative min-h-[300px] md:min-h-0 bg-surface-container">
        <img
          alt="Music Studio Hero"
          class="absolute inset-0 w-full h-full object-cover"
          src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-on-surface/85 to-transparent flex items-end p-8">
          <div class="text-white max-w-md">
            <h2 class="text-2xl md:text-3xl font-extrabold mb-3 font-sans">Sẵn sàng trải nghiệm MusicA</h2>
            <p class="text-sm opacity-90 leading-relaxed">
              Thiết lập thông tin cá nhân và mật khẩu để mở khóa toàn bộ tính năng tuyệt vời của chúng tôi.
            </p>
          </div>
        </div>
      </div>

      <!-- Right Side: Compact Form (Slightly larger fonts) -->
      <div class="w-full md:w-1/2 flex items-center justify-center bg-surface-container-lowest p-8 md:p-12">
        <div class="w-full max-w-sm">
          <!-- Logo Header -->
          <div class="mb-5">
            <h1 class="text-3xl font-extrabold text-primary tracking-tight">MusicA</h1>
          </div>

          <div class="text-left mb-5">
            <span class="inline-block px-3 py-1 bg-surface-container rounded-full text-primary text-xs font-bold uppercase mb-2">
              THÔNG TIN TÀI KHOẢN
            </span>
            <h2 class="text-2xl font-bold mb-1">Hoàn tất hồ sơ {{ role === 'ARTIST' ? 'Nghệ sĩ' : 'Người mua' }}</h2>
            <p class="text-sm text-text-mute">Nhập họ tên và thiết lập mật khẩu của bạn.</p>
          </div>

          <form @submit.prevent="handleComplete" class="space-y-4">
            <div class="space-y-1">
              <label class="block font-numeric-data text-sm font-semibold text-on-surface text-left" for="name">Họ và Tên</label>
              <input
                v-model="fullName"
                class="w-full h-11 px-4 rounded-xl bg-bg-soft border border-border-light text-sm text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
                id="name"
                placeholder="Nguyễn Văn A"
                required
                type="text"
              />
            </div>

            <div class="space-y-1">
              <label class="block font-numeric-data text-sm font-semibold text-on-surface text-left" for="password">Mật khẩu</label>
              <input
                v-model="password"
                class="w-full h-11 px-4 rounded-xl bg-bg-soft border border-border-light text-sm text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
                id="password"
                placeholder="••••••••"
                required
                type="password"
              />
            </div>

            <div class="space-y-1">
              <label class="block font-numeric-data text-sm font-semibold text-on-surface text-left" for="confirmPassword">Xác nhận mật khẩu</label>
              <input
                v-model="confirmPassword"
                class="w-full h-11 px-4 rounded-xl bg-bg-soft border border-border-light text-sm text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
                id="confirmPassword"
                placeholder="••••••••"
                required
                type="password"
              />
            </div>

            <!-- Error Alert -->
            <div v-if="errorMessage" class="p-3 bg-error-container border border-error rounded-xl text-error text-sm text-left">
              {{ errorMessage }}
            </div>

            <button
              class="w-full h-12 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-sm rounded-full flex items-center justify-center gap-1.5 hover:opacity-95 transition-all scale-95 active:scale-90"
              type="submit"
              :disabled="submitting"
            >
              <span v-if="submitting">Đang hoàn tất…</span>
              <template v-else>
                <span>Tạo tài khoản</span>
                <span class="material-symbols-outlined text-[18px]">check</span>
              </template>
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Bottom Row: Full-width Footer -->
    <footer class="w-full py-4 px-6 md:px-12 border-t border-border-light bg-surface-container-lowest text-xs text-text-mute shrink-0">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <nav class="flex flex-wrap justify-center sm:justify-start gap-4">
          <a class="hover:underline hover:text-primary transition-colors" href="#">Điều khoản sử dụng</a>
          <a class="hover:underline hover:text-primary transition-colors" href="#">Chính sách bảo mật</a>
          <a class="hover:underline hover:text-primary transition-colors" href="#">Thỏa thuận người dùng</a>
          <a class="hover:underline hover:text-primary transition-colors" href="#">Hỗ trợ</a>
        </nav>
        <div>
          © 2026 MusicA Inc. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>
