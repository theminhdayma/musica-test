<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../modules/auth/auth.store'
import { ApiError } from '../../shared/api/errors'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const token = computed(() => (route.query.token as string) || '')
const role = computed(() => {
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
        fullName: fullName.value.trim(),
        password: password.value,
        verificationToken: token.value
      })
      router.push({ name: 'my-products' })
    } else {
      await auth.registerBuyer({
        fullName: fullName.value.trim(),
        password: password.value,
        verificationToken: token.value
      })
      router.push({ name: 'my-certificates' })
    }
  } catch (e: any) {
    if (e instanceof ApiError) {
      errorMessage.value = e.message
    } else {
      errorMessage.value = 'Không thể hoàn tất đăng ký.'
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
          <h2 class="font-headline-lg text-4xl font-extrabold mb-4 font-sans">Sẵn sàng trải nghiệm MusicA</h2>
          <p class="font-body-md opacity-90">
            Thiết lập thông tin cá nhân và mật khẩu để mở khóa toàn bộ tính năng tuyệt vời của chúng tôi.
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
            THÔNG TIN TÀI KHOẢN
          </span>
          <h2 class="text-2xl font-bold mb-2">Hoàn tất hồ sơ {{ role === 'ARTIST' ? 'Nghệ sĩ' : 'Người mua' }}</h2>
          <p class="text-text-mute">Nhập họ tên và thiết lập mật khẩu của bạn.</p>
        </div>

        <form @submit.prevent="handleComplete" class="space-y-4">
          <div class="space-y-2">
            <label class="block font-numeric-data text-sm text-on-surface text-left" for="name">Họ và Tên</label>
            <input
              v-model="fullName"
              class="w-full h-12 px-4 rounded-xl bg-bg-soft border border-border-light text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
              id="name"
              placeholder="Nguyễn Văn A"
              required
              type="text"
            />
          </div>

          <div class="space-y-2">
            <label class="block font-numeric-data text-sm text-on-surface text-left" for="password">Mật khẩu</label>
            <input
              v-model="password"
              class="w-full h-12 px-4 rounded-xl bg-bg-soft border border-border-light text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
              id="password"
              placeholder="••••••••"
              required
              type="password"
            />
          </div>

          <div class="space-y-2">
            <label class="block font-numeric-data text-sm text-on-surface text-left" for="confirmPassword">Xác nhận mật khẩu</label>
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

          <button
            class="w-full h-12 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold rounded-full flex items-center justify-center gap-2 hover:opacity-95 transition-all scale-95 active:scale-90"
            type="submit"
            :disabled="submitting"
          >
            <span v-if="submitting">Đang hoàn tất…</span>
            <template v-else>
              <span>Tạo tài khoản</span>
              <span class="material-symbols-outlined text-[20px]">check</span>
            </template>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
