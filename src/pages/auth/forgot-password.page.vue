<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../modules/auth/auth.store'
import { ApiError } from '../../shared/api/errors'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// Lấy step hiện tại từ URL query
const step = computed(() => (route.query.step as string) || 'request')

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
    // Chuyển sang step OTP/Confirm
    router.push({ name: 'otp', query: { purpose: 'forgot_password' } })
  } catch (e: any) {
    if (e instanceof ApiError) {
      errorMessage.value = e.message
    } else {
      errorMessage.value = 'Không thể gửi yêu cầu đặt lại mật khẩu.'
    }
  } finally {
    submitting.value = false
  }
}

async function handleConfirm() {
  const token = route.query.token as string || ''
  const otpCode = route.query.code as string || code.value
  
  if (!otpCode || !newPassword.value) return
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp.'
    return
  }

  errorMessage.value = null
  submitting.value = true
  try {
    await auth.confirmForgotPassword(otpCode, newPassword.value)
    successMessage.value = 'Đặt lại mật khẩu thành công. Đang chuyển hướng về trang Đăng nhập...'
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 2000)
  } catch (e: any) {
    if (e instanceof ApiError) {
      errorMessage.value = e.message
    } else {
      errorMessage.value = 'Không thể xác nhận đổi mật khẩu. Mã OTP sai hoặc hết hạn.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-background text-on-surface font-body-md text-body-md flex flex-col md:flex-row w-full h-full overflow-hidden">
    <!-- Left Side: Hero Image -->
    <div class="hidden md:block w-1/2 h-full relative">
      <img
        alt="Music Studio Hero"
        class="w-full h-full object-cover"
        src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent flex items-end p-12">
        <div class="text-white max-w-lg">
          <h2 class="font-headline-lg text-4xl font-extrabold mb-4 font-sans font-bold">Khôi phục mật khẩu</h2>
          <p class="font-body-md opacity-90">
            Chúng tôi sẽ giúp bạn đặt lại mật khẩu một cách an toàn và bảo mật thông qua mã xác thực OTP.
          </p>
        </div>
      </div>
    </div>

    <!-- Right Side: Form -->
    <div class="w-full md:w-1/2 h-full flex flex-col relative overflow-y-auto bg-surface-container-lowest min-h-screen justify-center p-8 md:p-12 lg:p-16 xl:p-24">
      <div class="w-full max-w-md mx-auto">
        <!-- Logo Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-extrabold text-primary tracking-tight">MusicA</h1>
        </div>

        <div class="text-left mb-8">
          <span class="inline-block px-3 py-1 bg-surface-container rounded-full text-primary text-xs font-bold uppercase mb-3">
            QUÊN MẬT KHẨU
          </span>
          <h2 class="text-2xl font-bold mb-2">Đặt lại mật khẩu</h2>
          <p class="text-text-mute">
            {{ step === 'request' ? 'Nhập email của bạn để nhận mã xác minh OTP.' : 'Nhập mã xác nhận và đặt mật khẩu mới.' }}
          </p>
        </div>

        <!-- Step 1: Request OTP -->
        <form v-if="step === 'request'" @submit.prevent="handleRequest" class="space-y-4">
          <div class="space-y-2">
            <label class="block font-numeric-data text-sm text-on-surface text-left" for="email">Địa chỉ Email</label>
            <input
              v-model="email"
              class="w-full h-12 px-4 rounded-xl bg-bg-soft border border-border-light text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
              id="email"
              placeholder="ten@vidu.com"
              required
              type="email"
            />
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="p-4 bg-error-container border border-error rounded-xl text-error text-sm text-left">
            {{ errorMessage }}
          </div>

          <button
            class="w-full h-12 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold rounded-full flex items-center justify-center gap-2 hover:opacity-95 transition-all scale-95 active:scale-90"
            type="submit"
            :disabled="submitting"
          >
            <span v-if="submitting">Đang xử lý…</span>
            <span v-else>Gửi yêu cầu OTP</span>
          </button>
        </form>

        <!-- Step 2: Confirm OTP & Set New Password -->
        <form v-else @submit.prevent="handleConfirm" class="space-y-4">
          <div v-if="!route.query.code" class="space-y-2">
            <label class="block font-numeric-data text-sm text-on-surface text-left" for="code">Mã OTP xác nhận</label>
            <input
              v-model="code"
              class="w-full h-12 px-4 rounded-xl bg-bg-soft border border-border-light text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
              id="code"
              placeholder="123456"
              required
              type="text"
            />
          </div>

          <div class="space-y-2">
            <label class="block font-numeric-data text-sm text-on-surface text-left" for="newPassword">Mật khẩu mới</label>
            <input
              v-model="newPassword"
              class="w-full h-12 px-4 rounded-xl bg-bg-soft border border-border-light text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
              id="newPassword"
              placeholder="••••••••"
              required
              type="password"
            />
          </div>

          <div class="space-y-2">
            <label class="block font-numeric-data text-sm text-on-surface text-left" for="confirmPassword">Xác nhận mật khẩu mới</label>
            <input
              v-model="confirmPassword"
              class="w-full h-12 px-4 rounded-xl bg-bg-soft border border-border-light text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
              id="confirmPassword"
              placeholder="••••••••"
              required
              type="password"
            />
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="p-4 bg-error-container border border-error rounded-xl text-error text-sm text-left">
            {{ errorMessage }}
          </div>

          <!-- Success Alert -->
          <div v-if="successMessage" class="p-4 bg-teal-50 border border-teal-500 rounded-xl text-teal-600 text-sm text-left">
            {{ successMessage }}
          </div>

          <button
            class="w-full h-12 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold rounded-full flex items-center justify-center gap-2 hover:opacity-95 transition-all scale-95 active:scale-90"
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
</template>
