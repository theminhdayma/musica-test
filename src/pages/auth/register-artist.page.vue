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
    await auth.requestOtp(email.value.trim(), 'signup_artist')
    router.push({ name: 'otp', query: { purpose: 'signup_artist' } })
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
          <h2 class="font-headline-lg text-4xl font-extrabold mb-4 font-sans">Đăng ký Nghệ sĩ MusicA</h2>
          <p class="font-body-md opacity-90">
            Trở thành nghệ sĩ chính thức trên MusicA, upload các tác phẩm và bắt đầu tạo ra doanh thu từ bản quyền âm nhạc của chính bạn.
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
          <span class="inline-block px-3 py-1 bg-surface-container rounded-full text-secondary text-xs font-bold uppercase mb-3">
            ARTIST
          </span>
          <h2 class="text-2xl font-bold mb-2">Tạo tài khoản Artist</h2>
          <p class="text-text-mute">Nhập email nghệ sĩ của bạn để bắt đầu đăng ký.</p>
        </div>

        <form @submit.prevent="submitEmail" class="space-y-5">
          <div class="space-y-2">
            <label class="block font-numeric-data text-sm text-on-surface text-left" for="email">Email Nghệ sĩ</label>
            <input
              v-model="email"
              class="w-full h-12 px-4 rounded-xl bg-bg-soft border border-border-light text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
              id="email"
              placeholder="ten.nghe.si@email.com"
              required
              type="email"
            />
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="p-4 bg-error-container border border-error rounded-xl text-error text-sm text-left">
            {{ errorMessage }}
          </div>

          <button
            class="w-full h-12 bg-gradient-to-r from-secondary to-tertiary text-on-primary font-bold rounded-full flex items-center justify-center gap-2 hover:opacity-95 transition-all scale-95 active:scale-90"
            type="submit"
            :disabled="submitting"
          >
            <span v-if="submitting">Đang gửi OTP…</span>
            <template v-else>
              <span>Tiếp tục bằng Email</span>
              <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
            </template>
          </button>
        </form>

        <div class="mt-8 text-left text-sm text-text-soft">
          Đã có tài khoản?
          <router-link :to="{ name: 'login' }" class="text-primary font-bold hover:underline">Đăng nhập</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
