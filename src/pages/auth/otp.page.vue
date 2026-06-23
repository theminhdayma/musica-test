<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../modules/auth/auth.store'
import { getAuthErrorMessage } from '../../modules/auth/auth.messages'
import type { OtpPurpose } from '../../modules/auth/types'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../components/ui/input-otp'
import { Button } from '../../components/ui/button'
import { Alert, AlertDescription } from '../../components/ui/alert'

const loginBannerUrl = new URL('../../shared/ui/images/auth/login-banner.png', import.meta.url).href

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

const otpCode = ref('')
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

async function submitOtp(value?: string) {
  const code = (value ?? otpCode.value).trim()
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
      router.push({ name: 'forgot-password', query: { step: 'confirm', email: email.value, token } })
    }
  } catch (error) {
    errorMessage.value = getAuthErrorMessage(error, 'Mã OTP không hợp lệ hoặc đã hết hạn.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="w-full overflow-x-hidden bg-background text-on-surface font-body-md text-sm">
    <div class="min-h-screen flex w-full flex-col md:flex-row">
      <div v-once class="w-full md:w-1/2 relative min-h-[300px] md:min-h-0 bg-surface-container">
        <img
          alt="Music Studio Hero"
          class="absolute inset-0 w-full h-full object-cover"
          decoding="async"
          fetchpriority="high"
          loading="eager"
          :src="loginBannerUrl"
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

      <div class="w-full md:w-1/2 bg-surface-container-lowest px-6 py-10 sm:px-8 md:px-12 md:py-14">
        <div class="mx-auto flex min-h-full w-full max-w-md items-center">
          <div class="w-full px-1 py-2 sm:px-2">
          <div class="mb-5">
            <h1 class="text-3xl font-extrabold text-primary tracking-tight">MusicA</h1>
          </div>

          <div class="text-left mb-6">
            <h2 class="text-2xl font-bold mb-1">Nhập mã xác minh</h2>
            <p class="text-sm text-text-mute">
              Chúng tôi đã gửi mã xác minh 6 số đến email <span class="font-bold text-on-surface">{{ email }}</span>.
            </p>
          </div>

          <div class="space-y-5">
            <!-- OTP input box -->
            <div class="flex justify-center">
              <InputOTP
                v-model="otpCode"
                :maxlength="6"
                autocomplete="one-time-code"
                inputmode="numeric"
                @complete="submitOtp"
              >
                <InputOTPGroup>
                  <InputOTPSlot v-for="idx in 6" :key="idx" :index="idx - 1" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <!-- Error Alert -->
            <Alert v-if="errorMessage" variant="destructive" class="rounded-xl border-error bg-error-container text-error">
              <AlertDescription>
                {{ errorMessage }}
              </AlertDescription>
            </Alert>

            <Button
              @click="() => submitOtp()"
              class="h-11 w-full rounded-xl"
              :disabled="submitting || otpCode.length < 6"
              type="button"
            >
              <span v-if="submitting">Đang xác thực…</span>
              <span v-else>Xác minh OTP</span>
            </Button>

            <!-- Resend section -->
            <div class="text-left text-sm text-text-soft">
              <span v-if="cooldown > 0">
                Gửi lại mã sau <span class="font-bold text-on-surface">{{ cooldown }}s</span>
              </span>
              <Button
                v-else
                @click="handleResend"
                class="h-auto p-0 text-primary"
                type="button"
                variant="link"
              >
                Gửi lại mã OTP
              </Button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>

    <footer v-once class="w-full py-4 px-6 md:px-12 border-t border-border-light bg-surface-container-lowest text-xs text-text-mute">
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
