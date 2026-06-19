<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../modules/auth/auth.store'
import { ApiError } from '../../shared/api/errors'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const role = ref<'BUYER' | 'ARTIST'>('BUYER')
const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref<string | null>(null)

async function handleLogin() {
  if (!email.value.trim() || !password.value) return
  errorMessage.value = null
  submitting.value = true
  try {
    await auth.loginWithPassword(email.value.trim(), password.value, role.value)
    
    // Redirect logic
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    if (redirect) {
      await router.replace(redirect)
      return
    }
    
    if (auth.roles.includes('ARTIST')) {
      await router.replace({ name: 'my-products' })
    } else {
      await router.replace({ name: 'my-certificates' })
    }
  } catch (e: any) {
    if (e instanceof ApiError) {
      errorMessage.value = e.message
    } else if (e instanceof Error) {
      errorMessage.value = e.message
    } else {
      errorMessage.value = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
    }
  } finally {
    submitting.value = false
  }
}

async function handleGoogleLogin() {
  errorMessage.value = null
  submitting.value = true
  try {
    const mockFirebaseToken = 'mock-id-token-' + Math.random().toString(36).slice(2)
    await auth.loginWithGoogle(mockFirebaseToken)
    
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    if (redirect) {
      await router.replace(redirect)
    } else {
      await router.replace({ name: 'my-certificates' })
    }
  } catch (e: any) {
    if (e.code === 'PROVIDER_MISMATCH') {
      // Email đã đăng ký bằng password -> Tự động kích hoạt flow link_google (gửi OTP và chuyển sang nhập OTP)
      const targetEmail = email.value.trim() || 'user@example.com'
      await auth.requestOtp(targetEmail, 'link_google')
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
          <h2 class="font-headline-lg text-4xl font-extrabold mb-4 font-sans">Chào mừng trở lại MusicA</h2>
          <p class="font-body-md opacity-90">
            Đăng nhập để tiếp tục khám phá, giao dịch và quản lý các tài sản âm nhạc của bạn trên hệ thống.
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
            ĐĂNG NHẬP
          </span>
          <h2 class="text-2xl font-bold mb-2">Chào mừng trở lại</h2>
          <p class="text-text-mute">Đăng nhập để truy cập tài khoản marketplace của bạn.</p>
        </div>

        <!-- Role Selection -->
        <div class="flex p-1 bg-bg-soft rounded-xl mb-6 border border-border-light">
          <button
            @click="role = 'BUYER'"
            :class="[
              'flex-1 py-3 text-center rounded-lg font-bold text-sm transition-all border border-transparent',
              role === 'BUYER' ? 'bg-gradient-to-r from-primary-fixed to-secondary-fixed text-on-surface shadow-sm' : 'text-text-mute hover:text-on-surface'
            ]"
            type="button"
          >
            Người mua (Buyer)
          </button>
          <button
            @click="role = 'ARTIST'"
            :class="[
              'flex-1 py-3 text-center rounded-lg font-bold text-sm transition-all border border-transparent',
              role === 'ARTIST' ? 'bg-gradient-to-r from-primary-fixed to-secondary-fixed text-on-surface shadow-sm' : 'text-text-mute hover:text-on-surface'
            ]"
            type="button"
          >
            Nghệ sĩ (Artist)
          </button>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email Field -->
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

          <!-- Password Field -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <label class="block font-numeric-data text-sm text-on-surface" for="password">Mật khẩu</label>
              <router-link :to="{ name: 'forgot-password' }" class="text-xs text-primary font-bold hover:underline">
                Quên mật khẩu?
              </router-link>
            </div>
            <input
              v-model="password"
              class="w-full h-12 px-4 rounded-xl bg-bg-soft border border-border-light text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
              id="password"
              placeholder="••••••••"
              required
              type="password"
            />
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="p-4 bg-error-container border border-error rounded-xl text-error text-sm text-left">
            {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <button
            class="w-full h-14 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold rounded-full shadow-[0_4px_14px_0_rgba(0,107,95,0.2)] hover:shadow-[0_6px_20px_rgba(0,107,95,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2"
            type="submit"
            :disabled="submitting"
          >
            <span v-if="submitting">Đang đăng nhập…</span>
            <template v-else>
              <span>Đăng nhập</span>
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </template>
          </button>
        </form>

        <!-- Social Login (Only for Buyer) -->
        <div v-if="role === 'BUYER'" class="pt-6">
          <div class="relative flex items-center py-2 mb-4">
            <div class="flex-grow border-t border-border-light"></div>
            <span class="flex-shrink-0 mx-4 text-text-mute text-sm">hoặc</span>
            <div class="flex-grow border-t border-border-light"></div>
          </div>

          <button
            @click="handleGoogleLogin"
            class="w-full h-12 bg-surface border border-border-light text-on-surface font-bold rounded-full hover:bg-bg-soft hover:border-border-strong transition-all flex items-center justify-center gap-3"
            type="button"
            :disabled="submitting"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span>Google cho Buyer</span>
          </button>
        </div>

        <div class="mt-8 text-left text-sm text-text-soft">
          Chưa có tài khoản?
          <router-link :to="{ name: 'register-role' }" class="text-primary font-bold hover:underline">
            Đăng ký ngay
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
