<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../modules/auth/auth.store'
import { getAuthErrorMessage } from '../../modules/auth/auth.messages'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const step = computed(() => (route.query.step as string) || 'request')
const activeEmail = computed(() => (route.query.email as string) || auth.pendingForgotPassword?.email || auth.pendingOtpChallenge?.email || email.value.trim())

const email = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const submitting = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

async function handleRequest() {
  if (!email.value.trim()) return
  errorMessage.value = null
  submitting.value = true
  try {
    await auth.requestForgotPassword(email.value.trim())
    router.push({ name: 'otp', query: { purpose: 'forgot_password', email: email.value.trim() } })
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error, 'Không thể gửi yêu cầu đặt lại mật khẩu.')
  } finally {
    submitting.value = false
  }
}

async function handleConfirm() {
  const otpCode = (route.query.code as string) || code.value
  
  if (!otpCode || !newPassword.value) return
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp.'
    return
  }

  errorMessage.value = null
  submitting.value = true
  try {
    await auth.confirmForgotPassword({
      email: activeEmail.value,
      code: otpCode,
      newPassword: newPassword.value
    })
    successMessage.value = 'Đặt lại mật khẩu thành công. Đang chuyển hướng về trang Đăng nhập...'
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 2000)
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error, 'Không thể xác nhận đổi mật khẩu. Mã OTP sai hoặc hết hạn.')
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
          <div class="text-white max-w-lg">
            <h2 class="text-2xl md:text-3xl font-extrabold mb-3 font-sans font-bold">Khôi phục mật khẩu</h2>
            <p class="text-sm opacity-90 leading-relaxed">
              Chúng tôi sẽ giúp bạn đặt lại mật khẩu một cách an toàn và bảo mật thông qua mã xác thực OTP.
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
              QUÊN MẬT KHẨU
            </span>
            <h2 class="text-2xl font-bold mb-1">Đặt lại mật khẩu</h2>
            <p class="text-sm text-text-mute">
              {{ step === 'request' ? 'Nhập email của bạn để nhận mã xác minh OTP.' : 'Nhập mã xác nhận và đặt mật khẩu mới.' }}
            </p>
            <p v-if="step !== 'request' && activeEmail" class="mt-2 text-xs text-text-soft">
              Email đang đặt lại mật khẩu: <span class="font-bold text-on-surface">{{ activeEmail }}</span>
            </p>
          </div>

          <!-- Step 1: Request OTP -->
          <form v-if="step === 'request'" @submit.prevent="handleRequest" class="space-y-4">
            <div class="space-y-1">
              <label class="block font-numeric-data text-sm font-semibold text-on-surface text-left" for="email">Địa chỉ Email</label>
              <input
                v-model="email"
                class="w-full h-11 px-4 rounded-xl bg-bg-soft border border-border-light text-sm text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
                id="email"
                placeholder="ten@vidu.com"
                required
                type="email"
              />
            </div>

            <!-- Error Alert -->
            <div v-if="errorMessage" class="p-3 bg-error-container border border-error rounded-xl text-error text-sm text-left">
              {{ errorMessage }}
            </div>

            <button
              class="w-full h-12 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-sm rounded-full flex items-center justify-center gap-2 hover:opacity-95 transition-all scale-95 active:scale-90"
              type="submit"
              :disabled="submitting"
            >
              <span v-if="submitting">Đang xử lý…</span>
              <span v-else>Gửi yêu cầu OTP</span>
            </button>
          </form>

          <!-- Step 2: Confirm OTP & Set New Password -->
          <form v-else @submit.prevent="handleConfirm" class="space-y-4">
            <div v-if="!route.query.code" class="space-y-1">
              <label class="block font-numeric-data text-sm font-semibold text-on-surface text-left" for="code">Mã OTP xác nhận</label>
              <input
                v-model="code"
                class="w-full h-11 px-4 rounded-xl bg-bg-soft border border-border-light text-sm text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
                id="code"
                placeholder="123456"
                required
                type="text"
              />
            </div>

            <div class="space-y-1">
              <label class="block font-numeric-data text-sm font-semibold text-on-surface text-left" for="newPassword">Mật khẩu mới</label>
              <input
                v-model="newPassword"
                class="w-full h-11 px-4 rounded-xl bg-bg-soft border border-border-light text-sm text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
                id="newPassword"
                placeholder="••••••••"
                required
                type="password"
              />
            </div>

            <div class="space-y-1">
              <label class="block font-numeric-data text-sm font-semibold text-on-surface text-left" for="confirmPassword">Xác nhận mật khẩu mới</label>
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

            <!-- Success Alert -->
            <div v-if="successMessage" class="p-3 bg-teal-50 border border-teal-500 rounded-xl text-teal-600 text-sm text-left">
              {{ successMessage }}
            </div>

            <button
              class="w-full h-12 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-sm rounded-full flex items-center justify-center gap-2 hover:opacity-95 transition-all scale-95 active:scale-90"
              type="submit"
              :disabled="submitting || !!successMessage"
            >
              <span v-if="submitting">Đang thiết lập…</span>
              <span v-else>Cập nhật mật khẩu</span>
            </button>
          </form>

          <div class="mt-8 text-left text-sm text-text-soft">
            Nhớ mật khẩu?
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
