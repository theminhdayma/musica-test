<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useField, useForm } from 'vee-validate'
import { ArrowRight, Mail } from '@lucide/vue'
import { useAuthStore } from '../../modules/auth/auth.store'
import { getAuthErrorMessage } from '../../modules/auth/auth.messages'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Alert, AlertDescription } from '../../components/ui/alert'

const registerBannerUrl = new URL('../../shared/ui/images/auth/register-banner.png', import.meta.url).href

const router = useRouter()
const auth = useAuthStore()

const submitting = ref(false)
const submitError = ref<string | null>(null)

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
    await auth.requestOtp(normalizedEmail, 'signup_artist')
    router.push({ name: 'otp', query: { purpose: 'signup_artist', email: normalizedEmail, role: 'ARTIST' } })
  } catch (error) {
    submitError.value = getAuthErrorMessage(error, 'Không thể gửi mã OTP. Vui lòng thử lại.')
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
          :src="registerBannerUrl"
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

      <div class="w-full md:w-1/2 bg-surface-container-lowest px-6 py-10 sm:px-8 md:px-12 md:py-14">
        <div class="mx-auto flex min-h-full w-full max-w-md items-center">
          <div class="w-full px-1 py-2 sm:px-2">
          <div class="mb-5">
            <h1 class="text-3xl font-extrabold text-primary tracking-tight">MusicA</h1>
          </div>

          <div class="text-left mb-6">
            <h2 class="text-2xl font-bold mb-1">Tạo tài khoản Artist</h2>
            <p class="text-sm text-text-mute">Nhập email nghệ sĩ của bạn để bắt đầu đăng ký.</p>
          </div>

          <form @submit.prevent="submitEmail" novalidate class="space-y-4">
            <div class="space-y-2">
              <Label
                class="block text-left text-sm font-semibold"
                :class="showEmailError ? 'text-destructive' : 'text-on-surface'"
                for="email"
              >
                Email Nghệ sĩ
              </Label>
              <div class="relative">
                <Mail class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  v-model="email"
                  autocomplete="email"
                  :class="['h-11 rounded-xl bg-background pl-10 text-sm text-on-surface placeholder:text-muted-foreground', emailInputClass]"
                  id="email"
                  placeholder="ten.nghe.si@email.com"
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
              <span v-if="submitting">Đang gửi OTP…</span>
              <template v-else>
                <span>Tiếp tục bằng Email</span>
                <ArrowRight data-icon="inline-end" />
              </template>
            </Button>
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
