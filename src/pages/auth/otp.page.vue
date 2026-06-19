<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../modules/auth/auth.store'
import { getAuthErrorMessage } from '../../modules/auth/auth.messages'
import type { OtpPurpose } from '../../modules/auth/types'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const purpose = computed<OtpPurpose>(() => {
  const routePurpose = route.query.purpose
  if (routePurpose === 'signup_artist' || routePurpose === 'forgot_password' || routePurpose === 'signup_buyer') {
    return routePurpose
  }

  return auth.pendingOtpChallenge?.purpose || 'signup_buyer'
})
const email = computed(() => (route.query.email as string) || auth.pendingOtpChallenge?.email || 'người dùng')

const otpValues = ref(['', '', '', '', '', ''])
const submitting = ref(false)
const errorMessage = ref<string | null>(null)

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
  if (cooldown.value > 0 || email.value === 'người dùng') return
  errorMessage.value = null
  try {
    await auth.requestOtp(email.value, purpose.value)
    startTimer()
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error, 'Không thể gửi lại mã OTP.')
  }
}

function handleInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const val = input.value.replace(/\D/g, '')
  otpValues.value[index] = val.slice(-1)

  if (val && index < 5) {
    const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement | null
    if (nextInput) nextInput.focus()
  }

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
    const token = await auth.verifyOtp(code, {
      email: email.value,
      purpose: purpose.value
    })
    
    if (purpose.value === 'signup_buyer' || purpose.value === 'signup_artist') {
      router.push({
        name: 'complete-profile',
        query: {
          token,
          email: email.value,
          role: purpose.value === 'signup_artist' ? 'ARTIST' : 'BUYER'
        }
      })
    } else if (purpose.value === 'forgot_password') {
      router.push({ name: 'forgot-password', query: { step: 'confirm', email: email.value, token, code } })
    }
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error, 'Mã OTP không hợp lệ hoặc đã hết hạn.')
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
            <h2 class="text-2xl md:text-3xl font-extrabold mb-3 font-sans">Xác thực OTP an toàn</h2>
            <p class="text-sm opacity-90 leading-relaxed">
              Mã OTP giúp bảo vệ tài khoản của bạn khỏi các đăng nhập trái phép. Không chia sẻ mã này với bất kỳ ai.
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
              XÁC THỰC
            </span>
            <h2 class="text-2xl font-bold mb-1">Nhập mã xác minh</h2>
            <p class="text-sm text-text-mute">
              Chúng tôi đã gửi mã xác minh 6 số đến email <span class="font-bold text-on-surface">{{ email }}</span>.
            </p>
          </div>

          <div class="space-y-5">
            <!-- OTP input box -->
            <div class="flex justify-between gap-2">
              <input
                v-for="(val, idx) in otpValues"
                :key="idx"
                :id="`otp-${idx}`"
                v-model="otpValues[idx]"
                @input="handleInput(idx, $event)"
                @keydown="handleKeyDown(idx, $event)"
                class="w-12 h-14 text-center text-xl font-bold rounded-xl bg-bg-soft border border-border-light text-on-surface focus:outline-none focus:border-border-strong focus:bg-surface-container-lowest transition-all"
                type="text"
                maxlength="1"
                autocomplete="off"
              />
            </div>

            <!-- Error Alert -->
            <div v-if="errorMessage" class="p-3 bg-error-container border border-error rounded-xl text-error text-sm text-left">
              {{ errorMessage }}
            </div>

            <button
              @click="submitOtp"
              class="w-full h-12 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-sm rounded-full flex items-center justify-center gap-2 hover:opacity-95 transition-all scale-95 active:scale-90"
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
