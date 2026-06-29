<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useField, useForm } from 'vee-validate'
import { ArrowRight, Lock, Mail } from '@lucide/vue'
import { useAuthStore } from '../../modules/auth/auth.store'
import { getAuthErrorMessage } from '../../modules/auth/auth.messages'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Alert, AlertDescription } from '../../components/ui/alert'

const loginBannerUrl = new URL('../../shared/ui/images/auth/login-banner.png', import.meta.url).href

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const step = computed(() => (route.query.step as string) || 'request')
const activeEmail = computed(() => (route.query.email as string) || auth.pendingForgotPassword?.email || auth.pendingOtpChallenge?.email || email.value.trim())
const verificationToken = computed(() => (route.query.token as string) || auth.pendingForgotPassword?.verificationToken || '')

const submitting = ref(false)
const submitError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const { handleSubmit: handleRequestSubmit, submitCount: requestSubmitCount } = useForm<{ email: string }>({
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
}, { validateOnValueUpdate: false })

const showEmailError = computed(() => Boolean(emailError.value) && (emailMeta.touched || requestSubmitCount.value > 0))
const emailInputClass = computed(() =>
  showEmailError.value
    ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
    : 'border-input',
)

const handleRequest = handleRequestSubmit(async (values) => {
  submitError.value = null
  submitting.value = true
  try {
    const normalizedEmail = values.email.trim().toLowerCase()
    await auth.requestForgotPassword(normalizedEmail)
    router.push({ name: 'otp', query: { purpose: 'forgot_password', email: normalizedEmail } })
  } catch (error) {
    submitError.value = getAuthErrorMessage(error, 'Không thể gửi yêu cầu đặt lại mật khẩu.')
  } finally {
    submitting.value = false
  }
})

const { handleSubmit: handleConfirmSubmit, submitCount: confirmSubmitCount } = useForm<{
  newPassword: string
  confirmPassword: string
}>({
  initialValues: {
    newPassword: '',
    confirmPassword: ''
  }
})

const {
  value: newPassword,
  errorMessage: newPasswordError,
  handleBlur: handleNewPasswordBlur,
  meta: newPasswordMeta
} = useField<string>('newPassword', (value) => {
  if (!value?.trim()) {
    return 'Vui lòng nhập mật khẩu mới.'
  }
  return true
}, { validateOnValueUpdate: false })

const {
  value: confirmPassword,
  errorMessage: confirmPasswordError,
  handleBlur: handleConfirmPasswordBlur,
  meta: confirmPasswordMeta
} = useField<string>('confirmPassword', (value) => {
  if (!value?.trim()) {
    return 'Vui lòng nhập mật khẩu xác nhận.'
  }
  return true
}, { validateOnValueUpdate: false })

const showNewPasswordError = computed(() => Boolean(newPasswordError.value) && (newPasswordMeta.touched || confirmSubmitCount.value > 0))
const showConfirmPasswordError = computed(() => Boolean(confirmPasswordError.value) && (confirmPasswordMeta.touched || confirmSubmitCount.value > 0))
const newPasswordInputClass = computed(() =>
  showNewPasswordError.value
    ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
    : 'border-input',
)
const confirmPasswordInputClass = computed(() =>
  showConfirmPasswordError.value
    ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
    : 'border-input',
)

const handleConfirm = handleConfirmSubmit(async (values) => {
  submitError.value = null
  successMessage.value = null

  if (!verificationToken.value) {
    submitError.value = 'Phiên xác thực OTP không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại mã OTP.'
    return
  }

  if (values.newPassword !== values.confirmPassword) {
    submitError.value = 'Mật khẩu xác nhận không khớp.'
    return
  }

  submitting.value = true
  try {
    await auth.confirmForgotPassword({
      email: activeEmail.value,
      verificationToken: verificationToken.value,
      newPassword: values.newPassword
    })
    successMessage.value = 'Đặt lại mật khẩu thành công. Đang chuyển hướng về trang Đăng nhập...'
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 2000)
  } catch (error) {
    submitError.value = getAuthErrorMessage(error, 'Không thể xác nhận đổi mật khẩu. Mã OTP sai hoặc hết hạn.')
  } finally {
    submitting.value = false
  }
})
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
          <div class="text-white max-w-lg">
            <h2 class="text-2xl md:text-3xl font-extrabold mb-3 font-sans font-bold">Khôi phục mật khẩu</h2>
            <p class="text-sm opacity-90 leading-relaxed">
              Chúng tôi sẽ giúp bạn đặt lại mật khẩu một cách an toàn và bảo mật thông qua mã xác thực OTP.
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
            <h2 class="text-2xl font-bold mb-1">Đặt lại mật khẩu</h2>
            <p class="text-sm text-text-mute">
              {{ step === 'request' ? 'Nhập email của bạn để nhận mã xác minh OTP.' : 'Đặt mật khẩu mới sau khi mã OTP đã được xác thực.' }}
            </p>
            <p v-if="step !== 'request' && activeEmail" class="mt-2 text-xs text-text-soft">
              Email đang đặt lại mật khẩu: <span class="font-bold text-on-surface">{{ activeEmail }}</span>
            </p>
          </div>

          <!-- Step 1: Request OTP -->
          <form v-if="step === 'request'" @submit.prevent="handleRequest" novalidate class="space-y-4">
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
                  placeholder="ten@vidu.com"
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

            <Button class="mt-2 h-11 w-full rounded-xl" type="submit" :disabled="submitting">
              <span v-if="submitting">Đang xử lý…</span>
              <template v-else>
                <span>Gửi yêu cầu OTP</span>
                <ArrowRight data-icon="inline-end" />
              </template>
            </Button>
          </form>

          <!-- Step 2: Confirm OTP & Set New Password -->
          <form v-else @submit.prevent="handleConfirm" novalidate class="space-y-4">
            <div class="space-y-2">
              <Label
                class="block text-left text-sm font-semibold"
                :class="showNewPasswordError ? 'text-destructive' : 'text-on-surface'"
                for="newPassword"
              >
                Mật khẩu mới
              </Label>
              <div class="relative">
                <Lock class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  v-model="newPassword"
                  autocomplete="new-password"
                  :class="['h-11 rounded-xl bg-background pl-10 text-sm text-on-surface placeholder:text-muted-foreground', newPasswordInputClass]"
                  id="newPassword"
                  placeholder="••••••••"
                  :aria-invalid="showNewPasswordError ? 'true' : 'false'"
                  type="password"
                  @blur="handleNewPasswordBlur"
                />
              </div>
              <p v-if="showNewPasswordError" class="text-sm font-medium text-destructive">
                {{ newPasswordError }}
              </p>
            </div>

            <div class="space-y-2">
              <Label
                class="block text-left text-sm font-semibold"
                :class="showConfirmPasswordError ? 'text-destructive' : 'text-on-surface'"
                for="confirmPassword"
              >
                Xác nhận mật khẩu mới
              </Label>
              <div class="relative">
                <Lock class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  v-model="confirmPassword"
                  autocomplete="new-password"
                  :class="['h-11 rounded-xl bg-background pl-10 text-sm text-on-surface placeholder:text-muted-foreground', confirmPasswordInputClass]"
                  id="confirmPassword"
                  placeholder="••••••••"
                  :aria-invalid="showConfirmPasswordError ? 'true' : 'false'"
                  type="password"
                  @blur="handleConfirmPasswordBlur"
                />
              </div>
              <p v-if="showConfirmPasswordError" class="text-sm font-medium text-destructive">
                {{ confirmPasswordError }}
              </p>
            </div>

            <Alert v-if="submitError" variant="destructive" class="rounded-xl border-error bg-error-container text-error">
              <AlertDescription>
                {{ submitError }}
              </AlertDescription>
            </Alert>

            <Alert v-if="successMessage" class="rounded-xl border-teal-500 bg-teal-50 text-teal-700">
              <AlertDescription>
                {{ successMessage }}
              </AlertDescription>
            </Alert>

            <Button class="mt-2 h-11 w-full rounded-xl" type="submit" :disabled="submitting || !!successMessage">
              <span v-if="submitting">Đang thiết lập…</span>
              <template v-else>
                <span>Cập nhật mật khẩu</span>
                <ArrowRight data-icon="inline-end" />
              </template>
            </Button>
          </form>

          <div class="mt-8 text-left text-sm text-text-soft">
            Nhớ mật khẩu?
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
