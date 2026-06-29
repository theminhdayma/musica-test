<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useField, useForm } from 'vee-validate'
import { ArrowRight, Lock, Mail } from '@lucide/vue'
import { useAuthStore } from '../../modules/auth/auth.store'
import { getAuthErrorMessage } from '../../modules/auth/auth.messages'
import { getDefaultAuthenticatedRoute } from '../../modules/auth/auth.routing'
import { getFirebaseIdTokenFromGoogle, isGoogleClientConfigured } from '../../modules/auth/google-auth.client'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Separator } from '../../components/ui/separator'

const loginBannerUrl = new URL('../../shared/ui/images/auth/login-banner.png', import.meta.url).href

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const submitting = ref(false)
const submitError = ref<string | null>(null)
const isGoogleConfigured = isGoogleClientConfigured()

const { handleSubmit, submitCount } = useForm<{ email: string; password: string }>({
  initialValues: {
    email: '',
    password: ''
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
    return 'Vui lòng nhập email.'
  }
  return true
})

const {
  value: password,
  errorMessage: passwordError,
  handleBlur: handlePasswordBlur,
  meta: passwordMeta
} = useField<string>('password', (value) => {
  if (!value?.trim()) {
    return 'Vui lòng nhập mật khẩu.'
  }
  return true
})

const showEmailError = computed(() => Boolean(emailError.value) && (emailMeta.touched || submitCount.value > 0))
const showPasswordError = computed(() => Boolean(passwordError.value) && (passwordMeta.touched || submitCount.value > 0))
const emailInputClass = computed(() =>
  showEmailError.value
    ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
    : 'border-input',
)
const passwordInputClass = computed(() =>
  showPasswordError.value
    ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20'
    : 'border-input',
)

function getRedirectTarget() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
  if (redirect) {
    return redirect
  }

  return getDefaultAuthenticatedRoute(auth.roles, auth.selectedRole)
}

const handleLogin = handleSubmit(async (values) => {
  submitError.value = null
  submitting.value = true
  try {
    await auth.loginWithPassword(values.email.trim(), values.password)

    const redirectTarget = getRedirectTarget()
    await router.replace(redirectTarget)
  } catch (error) {
    submitError.value = getAuthErrorMessage(error, 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
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

    const redirectTarget = getRedirectTarget()
    await router.replace(redirectTarget)
  } catch (error) {
    submitError.value = getAuthErrorMessage(error, 'Đăng nhập Google thất bại.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="w-full overflow-x-hidden bg-background text-on-surface font-body-md text-sm">
    <div class="min-h-screen flex w-full flex-col md:flex-row">
      <!-- Left Side: Hero Image -->
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
            <h2 class="text-2xl md:text-3xl font-extrabold mb-3 font-sans">Chào mừng trở lại MusicA</h2>
            <p class="text-sm opacity-90 leading-relaxed">
              Đăng nhập để tiếp tục khám phá, giao dịch và quản lý các tài sản âm nhạc của bạn trên hệ thống.
            </p>
          </div>
        </div>
      </div>

      <div class="w-full md:w-1/2 bg-surface-container-lowest px-6 py-10 sm:px-8 md:px-12 md:py-14">
        <div class="mx-auto flex min-h-full w-full max-w-md items-center">
          <div class="w-full px-1 py-2 sm:px-2">
          <!-- Logo Header -->
          <div class="mb-6">
            <h1 class="text-3xl font-extrabold text-primary tracking-tight">MusicA</h1>
          </div>

          <div class="mb-6 text-left">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Đăng nhập</p>
            <h2 class="mt-2 text-2xl font-bold tracking-tight text-on-surface">Chào mừng trở lại</h2>
            <p class="mt-1 text-sm text-muted-foreground">Đăng nhập để truy cập tài khoản của bạn.</p>
          </div>

          <form @submit.prevent="handleLogin" novalidate class="space-y-4">
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

              <div class="space-y-2">
                <div class="flex items-center justify-between gap-3">
                  <Label
                    class="block text-sm font-semibold"
                    :class="showPasswordError ? 'text-destructive' : 'text-on-surface'"
                    for="password"
                  >
                    Mật khẩu
                  </Label>
                  <router-link :to="{ name: 'forgot-password' }" class="text-xs font-semibold text-primary hover:underline">
                    Quên mật khẩu?
                  </router-link>
                </div>
                <div class="relative">
                  <Lock class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    v-model="password"
                    autocomplete="current-password"
                    :class="['h-11 rounded-xl bg-background pl-10 text-sm text-on-surface placeholder:text-muted-foreground', passwordInputClass]"
                    id="password"
                    placeholder="••••••••"
                    :aria-invalid="showPasswordError ? 'true' : 'false'"
                    type="password"
                    @blur="handlePasswordBlur"
                  />
                </div>
                <p v-if="showPasswordError" class="text-sm font-medium text-destructive">
                  {{ passwordError }}
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
                <span v-if="submitting">Đang đăng nhập…</span>
                <template v-else>
                  <span>Đăng nhập</span>
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
              class="h-11 w-full rounded-xl justify-center gap-2 border-border bg-card text-on-surface hover:bg-muted"
              type="button"
              variant="outline"
              :disabled="submitting || !isGoogleConfigured"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span>{{ isGoogleConfigured ? 'Đăng nhập bằng Google (Buyer)' : 'Google chưa cấu hình' }}</span>
            </Button>
            <p class="mt-3 text-left text-xs text-text-soft">
              {{
                isGoogleConfigured
                  ? 'Google login hiện chỉ áp dụng cho tài khoản Buyer. Artist vui lòng đăng nhập bằng email và mật khẩu.'
                  : 'Thiếu biến môi trường Firebase nên chưa thể chạy flow Google thật trên client.'
              }}
            </p>
          </div>

          <div class="mt-8 border-t border-border pt-5 text-left text-sm text-text-soft">
            <span>Chưa có tài khoản?</span>
            <router-link :to="{ name: 'register-role' }" class="ml-1 font-semibold text-primary hover:underline">
              Đăng ký ngay
            </router-link>
          </div>
          </div>
        </div>
      </div>
    </div>

    <footer v-once class="w-full border-t border-border-light bg-surface-container-lowest px-6 py-4 text-xs text-text-mute md:px-12">
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
