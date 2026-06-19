<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../modules/auth/auth.store'
import { ApiError } from '../../shared/api/errors'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// Lấy mục đích OTP từ query
const purpose = computed(() => (route.query.purpose as string) || auth.pendingOtpChallenge?.purpose || 'signup_buyer')
const email = computed(() => auth.pendingOtpChallenge?.email || 'người dùng')

const otpValues = ref(['', '', '', '', '', ''])
const submitting = ref(false)
const errorMessage = ref<string | null>(null)

// Resend OTP Cooldown
const cooldown = ref(60)
let timer: any = null

function startTimer() {
  cooldown.value = 60
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (cooldown.value > 0) {
      cooldown.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

async function handleResend() {
  if (cooldown.value > 0 || !auth.pendingOtpChallenge?.email) return
  errorMessage.value = null
  try {
    await auth.requestOtp(auth.pendingOtpChallenge.email, auth.pendingOtpChallenge.purpose)
    startTimer()
  } catch (e: any) {
    if (e instanceof ApiError) {
      errorMessage.value = e.message
    } else {
      errorMessage.value = 'Không thể gửi lại mã OTP.'
    }
  }
}

// Chuyển focus giữa các ô input OTP
function handleInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const val = input.value.replace(/\D/g, '') // Chỉ giữ lại số
  otpValues.value[index] = val.slice(-1) // Chỉ lấy 1 ký tự cuối

  if (val && index < 5) {
    const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement | null
    if (nextInput) nextInput.focus()
  }

  // Tự động submit nếu điền đủ 6 số
  if (otpValues.value.every((v) => v !== '')) {
    submitOtp()
  }
}

function handleKeyDown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !otpValues.value[index] && index > 0) {
    otpValues.value[index - 1] = ''
    const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement | null
    if (prevInput) {
      prevInput.focus()
    }
  }
}

async function submitOtp() {
  const code = otpValues.value.join('')
  if (code.length < 6) return

  errorMessage.value = null
  submitting.value = true
  try {
    const token = await auth.verifyOtp(code)
    
    // Điều hướng dựa trên purpose
    if (purpose.value === 'signup_buyer' || purpose.value === 'signup_artist') {
      router.push({ name: 'complete-profile', query: { token } })
    } else if (purpose.value === 'link_google') {
      await auth.linkGoogle(token)
      // Link Google thành công -> Chuyển về home
      router.push({ name: 'home' })
    } else if (purpose.value === 'forgot_password') {
      router.push({ name: 'forgot-password', query: { step: 'confirm', token, code } })
    }
  } catch (e: any) {
    if (e instanceof ApiError) {
      errorMessage.value = e.message
    } else {
      errorMessage.value = 'Mã OTP không hợp lệ hoặc đã hết hạn.'
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
          <h2 class="font-headline-lg text-4xl font-extrabold mb-4 font-sans">Xác thực OTP an toàn</h2>
          <p class="font-body-md opacity-90">
            Mã OTP giúp bảo vệ tài khoản của bạn khỏi các đăng nhập trái phép. Không chia sẻ mã này với bất kỳ ai.
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
            XÁC THỰC
          </span>
          <h2 class="text-2xl font-bold mb-2">Nhập mã xác minh</h2>
          <p class="text-text-mute">
            Chúng tôi đã gửi mã xác minh 6 số đến email <span class="font-bold text-on-surface">{{ email }}</span>.
          </p>
        </div>

        <div class="space-y-6">
          <!-- OTP input box -->
          <div class="flex justify-between gap-2">
            <input
              v-for="(val, idx) in otpValues"
              :key="idx"
              :id="`otp-${idx}`"
              v-model="otpValues[idx]"
              @input="handleInput(idx, $event)"
              @keydown="handleKeyDown(idx, $event)"
              class="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-bold rounded-xl bg-bg-soft border border-border-light text-on-surface focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
              type="text"
              maxlength="1"
              autocomplete="off"
            />
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="p-4 bg-error-container border border-error rounded-xl text-error text-sm text-left">
            {{ errorMessage }}
          </div>

          <button
            @click="submitOtp"
            class="w-full h-12 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold rounded-full flex items-center justify-center gap-2 hover:opacity-95 transition-all scale-95 active:scale-90"
            :disabled="submitting || otpValues.some(v => v === '')"
          >
            <span v-if="submitting">Đang xác thực…</span>
            <span v-else>Xác minh OTP</span>
          </button>

          <!-- Resend section -->
          <div class="text-left text-sm text-text-soft">
            <span v-if="cooldown > 0">
              Gửi lại mã sau <span class="font-bold text-on-surface">{{ cooldown }}s</span>
            </span>
            <button
              v-else
              @click="handleResend"
              class="text-primary font-bold hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              Gửi lại mã OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
