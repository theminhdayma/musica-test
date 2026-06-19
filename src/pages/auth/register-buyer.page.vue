<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../modules/auth/auth.store'
import { ApiError } from '../../shared/api/errors'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const submitting = ref(false)
const errorMessage = ref<string | null>(null)

async function submitEmail() {
  if (!email.value.trim()) return
  errorMessage.value = null
  submitting.value = true
  try {
    await auth.requestOtp(email.value.trim(), 'signup_buyer')
    router.push({ name: 'otp', query: { purpose: 'signup_buyer' } })
  } catch (e: any) {
    if (e instanceof ApiError) {
      errorMessage.value = e.message
    } else {
      errorMessage.value = 'Không thể gửi mã OTP. Vui lòng thử lại.'
    }
  } finally {
    submitting.value = false
  }
}

async function handleGoogleLogin() {
  errorMessage.value = null
  submitting.value = true
  try {
    // Trình diễn: tạo mock token từ firebase client
    const mockFirebaseToken = 'mock-id-token-' + Math.random().toString(36).slice(2)
    await auth.loginWithGoogle(mockFirebaseToken)
    router.push({ name: 'home' })
  } catch (e: any) {
    if (e.code === 'PROVIDER_MISMATCH') {
      // Email đã tồn tại dạng password -> Chuyển sang luồng link_google (yêu cầu gửi OTP link_google)
      const emailLink = email.value.trim() || 'user@example.com' // Dùng email hiện có hoặc email giả lập
      await auth.requestOtp(emailLink, 'link_google')
      router.push({ name: 'otp', query: { purpose: 'link_google' } })
    } else if (e instanceof ApiError) {
      errorMessage.value = e.message
    } else {
      errorMessage.value = 'Đăng nhập Google thất bại.'
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
          <h2 class="font-headline-lg text-4xl font-extrabold mb-4 font-sans">Mua bản quyền MusicA</h2>
          <p class="font-body-md opacity-90">
            Sở hữu và bảo vệ bản quyền âm nhạc đỉnh cao một cách dễ dàng, nhanh chóng và an toàn.
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
            NGƯỜI MUA
          </span>
          <h2 class="text-2xl font-bold mb-2">Tạo tài khoản Buyer</h2>
          <p class="text-text-mute">Nhập email của bạn để bắt đầu đăng ký.</p>
        </div>

        <form @submit.prevent="submitEmail" class="space-y-5">
          <div class="space-y-2">
            <label class="block font-numeric-data text-sm text-on-surface text-left" for="email">Địa chỉ Email</label>
            <input
              v-model="email"
              class="w-full h-12 px-4 rounded-xl bg-bg-soft border border-border-light text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
              id="email"
              placeholder="nhac.cua.ban@email.com"
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
            <template v-else>
              <span>Tiếp tục bằng Email</span>
              <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
            </template>
          </button>
        </form>

        <!-- Google Auth Section -->
        <div class="pt-6">
          <div class="relative flex items-center py-2 mb-4">
            <div class="flex-grow border-t border-border-light"></div>
            <span class="flex-shrink-0 mx-4 text-text-mute text-sm">hoặc</span>
            <div class="flex-grow border-t border-border-light"></div>
          </div>

          <button
            @click="handleGoogleLogin"
            class="w-full h-12 bg-surface-container-lowest border border-border-light text-on-surface font-bold rounded-full flex items-center justify-center gap-3 hover:bg-bg-soft transition-colors scale-95 active:scale-90"
            type="button"
            :disabled="submitting"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span>Đăng ký bằng Google</span>
          </button>
        </div>

        <div class="mt-8 text-left text-sm text-text-soft">
          Đã có tài khoản?
          <router-link :to="{ name: 'login' }" class="text-primary font-bold hover:underline">Đăng nhập</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
