<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../modules/auth/auth.store'
import { ApiError } from '../../shared/api/errors'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const remember = ref(true)
const submitting = ref(false)
const errorMessage = ref<string | null>(null)
const errorRequestId = ref<string | null>(null)

async function submit() {
  errorMessage.value = null
  errorRequestId.value = null
  submitting.value = true
  try {
    await auth.login({ email: email.value.trim(), password: password.value, remember: remember.value })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    if (redirect) {
      await router.replace(redirect)
      return
    }
    if (auth.roles.includes('ARTIST')) {
      await router.replace({ name: 'my-products' })
      return
    }
    await router.replace({ name: 'my-certificates' })
  } catch (e) {
    if (e instanceof ApiError) {
      errorMessage.value = e.message
      errorRequestId.value = e.requestId || null
    } else if (e instanceof Error) {
      errorMessage.value = e.message
    } else {
      errorMessage.value = 'Đăng nhập thất bại'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container section">
    <div class="card" style="max-width: 520px; margin: 0 auto;">
      <h1 style="margin: 0 0 8px;">Đăng nhập</h1>
      <p class="muted" style="margin: 0 0 18px;">Dùng tài khoản BUYER hoặc ARTIST để truy cập khu vực của bạn.</p>

      <div class="field">
        <label class="label">Email</label>
        <input v-model="email" class="input" type="email" autocomplete="email" />
      </div>

      <div class="field">
        <label class="label">Mật khẩu</label>
        <input v-model="password" class="input" type="password" autocomplete="current-password" />
      </div>

      <label style="display: flex; gap: 10px; align-items: center; margin: 12px 0 16px;">
        <input v-model="remember" type="checkbox" />
        <span class="muted">Ghi nhớ trong phiên làm việc</span>
      </label>

      <div v-if="errorMessage" class="card" style="background: #fff1f2; border-color: #fecdd3; margin-bottom: 12px;">
        <div style="font-weight: 700;">Không thể đăng nhập</div>
        <div class="muted">{{ errorMessage }}</div>
        <div v-if="errorRequestId" class="muted" style="margin-top: 6px;">Request ID: {{ errorRequestId }}</div>
      </div>

      <button class="btn btn-primary btn-lg" type="button" style="width: 100%;" :disabled="submitting" @click="submit">
        <span v-if="submitting">Đang đăng nhập…</span>
        <span v-else>Đăng nhập</span>
      </button>
    </div>
  </div>
</template>
