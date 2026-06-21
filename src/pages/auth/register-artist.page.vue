<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../modules/auth/auth.store'
import { getAuthErrorMessage } from '../../modules/auth/auth.messages'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const submitting = ref(false)
const errorMessage = ref<string | null>(null)
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
    await auth.requestOtp(normalizedEmail, 'signup_artist')
    router.push({ name: 'otp', query: { purpose: 'signup_artist', email: normalizedEmail, role: 'ARTIST' } })
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error, 'Không thể gửi mã OTP. Vui lòng thử lại.')
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
            <h2 class="text-2xl md:text-3xl font-extrabold mb-3 font-sans">Đăng ký Nghệ sĩ MusicA</h2>
            <p class="text-sm opacity-90 leading-relaxed">
              Trở thành nghệ sĩ chính thức trên MusicA, upload các tác phẩm và bắt đầu tạo ra doanh thu từ bản quyền âm nhạc của chính bạn.
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
            <span class="inline-block px-3 py-1 bg-surface-container rounded-full text-secondary text-xs font-bold uppercase mb-2">
              ARTIST
            </span>
            <h2 class="text-2xl font-bold mb-1">Tạo tài khoản Artist</h2>
            <p class="text-sm text-text-mute">Nhập email nghệ sĩ của bạn để bắt đầu đăng ký.</p>
          </div>

          <form @submit.prevent="submitEmail" class="space-y-4">
            <div class="space-y-1">
              <label class="block font-numeric-data text-sm font-semibold text-on-surface text-left" for="email">Email Nghệ sĩ</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <span class="material-symbols-outlined text-[18px]">mail</span>
                </span>
                <input
                  v-model="email"
                  class="w-full h-11 pl-10 pr-3 bg-bg-soft border border-border-light rounded-xl text-sm text-on-surface placeholder:text-text-mute focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
                  id="email"
                  placeholder="ten.nghe.si@email.com"
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
              class="w-full h-12 bg-gradient-to-r from-secondary to-tertiary text-on-primary font-bold text-sm rounded-full flex items-center justify-center gap-1.5 hover:opacity-95 transition-all scale-95 active:scale-90"
              type="submit"
              :disabled="submitting"
            >
              <span v-if="submitting">Đang gửi OTP…</span>
              <template v-else>
                <span>Tiếp tục bằng Email</span>
                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </template>
            </button>
          </form>

          <div class="mt-8 text-left text-xs text-text-soft">
            Artist hiện chỉ hỗ trợ đăng ký và đăng nhập bằng email cùng mật khẩu, chưa hỗ trợ Google.
          </div>

          <div class="mt-3 text-left text-xs text-text-soft">
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
