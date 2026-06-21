<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../modules/auth/auth.store'
import { getAuthErrorMessage } from '../../modules/auth/auth.messages'
import { getDefaultAuthenticatedRoute } from '../../modules/auth/auth.routing'
import { getFirebaseIdTokenFromGoogle, isGoogleClientConfigured } from '../../modules/auth/google-auth.client'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const submitting = ref(false)
const errorMessage = ref<string | null>(null)
const isGoogleConfigured = isGoogleClientConfigured()
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function submitEmail() {
  const normalizedEmail = email.value.trim().toLowerCase()
  if (!normalizedEmail) {
    errorMessage.value = 'Vui lòng nhập email để tiếp tục.'
    return
  }
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    errorMessage.value = 'Email không đúng định dạng.'
    return
  }
  errorMessage.value = null
  submitting.value = true
  try {
    await auth.requestOtp(normalizedEmail, 'signup_buyer')
    router.push({ name: 'otp', query: { purpose: 'signup_buyer', email: normalizedEmail, role: 'BUYER' } })
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error, 'Không thể gửi mã OTP. Vui lòng thử lại.')
  } finally {
    submitting.value = false
  }
}

async function handleGoogleLogin() {
  errorMessage.value = null
  submitting.value = true
  try {
    auth.setSelectedRole('BUYER')
    const firebaseIdToken = await getFirebaseIdTokenFromGoogle()
    await auth.loginWithGoogle(firebaseIdToken)
    router.push(getDefaultAuthenticatedRoute(auth.roles, 'BUYER'))
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error, 'Đăng ký bằng Google thất bại.')
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
            <h2 class="text-2xl md:text-3xl font-extrabold mb-3 font-sans">Mua bản quyền MusicA</h2>
            <p class="text-sm opacity-90 leading-relaxed">
              Sở hữu và bảo vệ bản quyền âm nhạc đỉnh cao một cách dễ dàng, nhanh chóng và an toàn.
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

          <div class="text-left mb-6">
            <span class="inline-block px-3 py-1 bg-surface-container rounded-full text-primary text-xs font-bold uppercase mb-2">
              NGƯỜI MUA
            </span>
            <h2 class="text-2xl font-bold mb-1">Tạo tài khoản Buyer</h2>
            <p class="text-sm text-text-mute">Nhập email của bạn để bắt đầu đăng ký.</p>
          </div>

          <form @submit.prevent="submitEmail" class="space-y-4">
              <div class="space-y-1">
                <label class="block font-numeric-data text-sm font-semibold text-on-surface text-left" for="email">Địa chỉ Email</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                    <span class="material-symbols-outlined text-[18px]">mail</span>
                  </span>
                  <input
                    v-model="email"
                    class="w-full h-11 pl-10 pr-3 bg-bg-soft border border-border-light rounded-xl text-sm text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
                    id="email"
                    placeholder="nhac.cua.ban@email.com"
                    required
                    type="email"
                  />
                </div>
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
                <span v-if="submitting">Đang xử lý…</span>
                <template v-else>
                  <span>Tiếp tục bằng Email</span>
                  <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                </template>
              </button>
          </form>

          <!-- Google Auth Section -->
          <div class="pt-5">
            <div class="relative flex items-center py-1 mb-3">
              <div class="flex-grow border-t border-border-light"></div>
              <span class="flex-shrink-0 mx-3 text-text-mute text-xs uppercase">hoặc</span>
              <div class="flex-grow border-t border-border-light"></div>
            </div>

            <button
              @click="handleGoogleLogin"
              class="w-full h-11 bg-surface-container-lowest border border-border-light text-on-surface font-bold text-sm rounded-full flex items-center justify-center gap-2 hover:bg-bg-soft transition-colors scale-95 active:scale-90"
              type="button"
              :disabled="submitting || !isGoogleConfigured"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span>{{ isGoogleConfigured ? 'Tiếp tục bằng Google' : 'Google chưa cấu hình' }}</span>
            </button>
            <p class="mt-2 text-left text-xs text-text-soft">
              {{
                isGoogleConfigured
                  ? 'Google signup/login cho Buyer gọi trực tiếp `POST /client/auth/login/google`.'
                  : 'Thiếu cấu hình Firebase nên frontend chưa thể lấy `firebaseIdToken` thật.'
              }}
            </p>
          </div>

          <div class="mt-8 text-left text-sm text-text-soft">
            Đã có tài khoản?
            <router-link :to="{ name: 'login' }" class="text-primary font-bold hover:underline">Đăng nhập</router-link>
          </div>
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
