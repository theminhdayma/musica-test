<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useField, useForm } from 'vee-validate'
import { ArrowRight, Mail } from '@lucide/vue'
import { useAuthStore } from '../../modules/auth/auth.store'
import { getAuthErrorMessage } from '../../modules/auth/auth.messages'
import { getDefaultAuthenticatedRoute } from '../../modules/auth/auth.routing'
import { getFirebaseIdTokenFromGoogle, isGoogleClientConfigured } from '../../modules/auth/google-auth.client'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Separator } from '../../components/ui/separator'

const registerBannerUrl = new URL('../../shared/ui/images/auth/register-banner.png', import.meta.url).href
const router = useRouter()
const auth = useAuthStore()

const submitting = ref(false)
const submitError = ref<string | null>(null)
const isGoogleConfigured = isGoogleClientConfigured()

const { handleSubmit, submitCount } = useForm<{ email: string }>({
  initialValues: {
    email: ''
  }
})

const {
  value: email,
  errorMessage: emailError,
  handleBlur: handleEmailBlur,
  meta: emailMeta
} = useField<string>('email', (value) => {
  const normalizedEmail = value?.trim() || ''
  if (!normalizedEmail) {
    return 'Vui lòng nhập email để tiếp tục.'
  }
  return true
})

const showEmailError = computed(() => Boolean(emailError.value) && (emailMeta.touched || submitCount.value > 0))
const emailInputClass = computed(() =>
  showEmailError.value
    ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
    : 'border-input',
)

const submitEmail = handleSubmit(async (values) => {
  submitError.value = null
  submitting.value = true
  try {
    const normalizedEmail = values.email.trim().toLowerCase()
    await auth.requestOtp(normalizedEmail, 'signup_buyer')
    router.push({ name: 'otp', query: { purpose: 'signup_buyer', email: normalizedEmail, role: 'BUYER' } })
  } catch (error) {
    submitError.value = getAuthErrorMessage(error, 'Không thể gửi mã OTP. Vui lòng thử lại.')
  } finally {
    submitting.value = false
  }
})

async function handleGoogleLogin() {
  submitError.value = null
  submitting.value = true
  try {
    auth.setSelectedRole('BUYER')
    const firebaseIdToken = await getFirebaseIdTokenFromGoogle()
    await auth.loginWithGoogle(firebaseIdToken)
    router.push(getDefaultAuthenticatedRoute(auth.roles, 'BUYER'))
  } catch (error) {
    submitError.value = getAuthErrorMessage(error, 'Đăng ký bằng Google thất bại.')
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
          :src="registerBannerUrl"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-on-surface/85 to-transparent flex items-end p-8">
          <div class="text-white max-w-md">
            <h2 class="text-2xl md:text-3xl font-extrabold mb-3 font-sans">Mua bản quyền MusicA</h2>
            <p class="text-sm opacity-90 leading-relaxed">
              Sở hữu và bảo vệ bản quyền âm nhạc đỉnh cao một cách dễ dàng, nhanh chóng và an toàn.
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
            <h2 class="text-2xl font-bold mb-1">Tạo tài khoản Buyer</h2>
            <p class="text-sm text-text-mute">Nhập email của bạn để bắt đầu đăng ký.</p>
          </div>

          <form @submit.prevent="submitEmail" novalidate class="space-y-4">
            <div class="space-y-2">
              <Label
                class="block text-left text-sm font-semibold"
                :class="showEmailError ? 'text-destructive' : 'text-on-surface'"
                for="email"
              >
                Địa chỉ Email
              </Label>
              <div class="relative">
                <Mail class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  v-model="email"
                  autocomplete="email"
                  :class="['h-11 rounded-xl bg-background pl-10 text-sm text-on-surface placeholder:text-muted-foreground', emailInputClass]"
                  id="email"
                  placeholder="nhac.cua.ban@email.com"
                  :aria-invalid="showEmailError ? 'true' : 'false'"
                  type="email"
                  @blur="handleEmailBlur"
                />
              </div>
              <p v-if="showEmailError" class="text-sm font-medium text-destructive">
                {{ emailError }}
              </p>
            </div>

            <Alert v-if="submitError" variant="destructive" class="rounded-xl border-error bg-error-container text-error">
              <AlertDescription>
                {{ submitError }}
              </AlertDescription>
            </Alert>

            <Button
              class="mt-2 h-11 w-full rounded-xl"
              type="submit"
              :disabled="submitting"
            >
              <span v-if="submitting">Đang xử lý…</span>
              <template v-else>
                <span>Tiếp tục bằng Email</span>
                <ArrowRight data-icon="inline-end" />
              </template>
            </Button>
          </form>

          <div class="pt-5">
            <div class="mb-4 flex items-center gap-3 overflow-hidden">
              <div class="min-w-0 flex-1">
                <Separator class="w-full bg-border-light" />
              </div>
              <span class="shrink-0 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">hoặc</span>
              <div class="min-w-0 flex-1">
                <Separator class="w-full bg-border-light" />
              </div>
            </div>

            <Button
              @click="handleGoogleLogin"
              type="button"
              variant="outline"
              class="h-11 w-full rounded-xl justify-center gap-2 border-border bg-card text-on-surface hover:bg-muted"
              :disabled="submitting || !isGoogleConfigured"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span>{{ isGoogleConfigured ? 'Tiếp tục bằng Google' : 'Google chưa cấu hình' }}</span>
            </Button>
            <p class="mt-2 text-left text-xs text-text-soft">
              {{
                isGoogleConfigured
                  ? 'Google signup/login cho Buyer gọi trực tiếp `POST /client/auth/login/google`.'
                  : 'Thiếu cấu hình Firebase nên frontend chưa thể lấy `firebaseIdToken` thật.'
              }}
            </p>
          </div>

          <div class="mt-8 text-left text-sm text-text-soft">
            Đã có tài khoản?
            <router-link :to="{ name: 'login' }" class="text-primary font-bold hover:underline">Đăng nhập</router-link>
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
