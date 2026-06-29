<script setup lang="ts">
import { computed, ref } from 'vue'
import MeAccountLayout from '../../components/features/me/MeAccountLayout.vue'
import HintIcon from '../../shared/ui/HintIcon.vue'
import { changePasswordApi } from '../../modules/auth/auth.api'
import { ApiError } from '../../shared/api/errors'
import { useAuthStore } from '../../modules/auth/auth.store'

const auth = useAuthStore()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showOld = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
const touched = ref({ old: false, new: false, confirm: false })

const submitting = ref(false)
const submitError = ref<string | null>(null)
const submitSuccess = ref<string | null>(null)

const oldPasswordError = computed(() => {
  if (!touched.value.old) return null
  if (!oldPassword.value.trim()) return 'Vui lòng nhập mật khẩu cũ.'
  return null
})

const newPasswordStrength = computed(() => {
  const v = newPassword.value
  if (!v) return 0
  let score = 0
  if (v.length >= 8) score++
  if (/[a-zA-Z]/.test(v)) score++
  if (/\d/.test(v)) score++
  if (/[^a-zA-Z0-9]/.test(v)) score++
  return score
})

const strengthInfo = computed(() => {
  const s = newPasswordStrength.value
  if (!newPassword.value) return null
  if (s <= 1) return { text: 'Yếu', color: '#ef4444', bg: '#fef2f2', width: '25%' }
  if (s === 2) return { text: 'Trung bình', color: '#f59e0b', bg: '#fffbeb', width: '50%' }
  if (s === 3) return { text: 'Tốt', color: '#22c55e', bg: '#f0fdf4', width: '75%' }
  return { text: 'Rất mạnh', color: '#1f6df0', bg: '#eaf3ff', width: '100%' }
})

const newPasswordError = computed(() => {
  if (!touched.value.new) return null
  const value = newPassword.value
  if (!value.trim()) return 'Vui lòng nhập mật khẩu mới.'
  if (value.length < 8) return 'Mật khẩu mới phải có ít nhất 8 ký tự.'
  if (value.length > 72) return 'Mật khẩu mới không được vượt quá 72 ký tự.'
  if (/\s/.test(value)) return 'Mật khẩu mới không được chứa khoảng trắng.'
  if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) return 'Mật khẩu mới phải có ít nhất 1 chữ cái và 1 chữ số.'
  if (oldPassword.value && value === oldPassword.value) return 'Mật khẩu mới phải khác mật khẩu cũ.'
  return null
})

const confirmPasswordError = computed(() => {
  if (!touched.value.confirm) return null
  if (!confirmPassword.value.trim()) return 'Vui lòng nhập xác nhận mật khẩu mới.'
  if (confirmPassword.value !== newPassword.value) return 'Xác nhận mật khẩu không khớp.'
  return null
})

const confirmMatch = computed(() =>
  !confirmPasswordError.value && confirmPassword.value && confirmPassword.value === newPassword.value
)

const canSubmit = computed(() =>
  !oldPasswordError.value && !newPasswordError.value && !confirmPasswordError.value
  && oldPassword.value && newPassword.value && confirmPassword.value
  && !submitting.value
)

const accountRoleLabel = computed(() => auth.me?.user?.roleName === 'BUYER' ? 'buyer' : 'nghệ sĩ')

async function submit() {
  touched.value = { old: true, new: true, confirm: true }
  submitError.value = null
  submitSuccess.value = null

  if (!canSubmit.value) {
    submitError.value = 'Vui lòng kiểm tra lại thông tin.'
    return
  }

  submitting.value = true
  try {
    await changePasswordApi({ oldPassword: oldPassword.value, newPassword: newPassword.value })
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    touched.value = { old: false, new: false, confirm: false }
    submitSuccess.value = 'Đổi mật khẩu thành công!'
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.code === 'INVALID_OLD_PASSWORD') {
        submitError.value = 'Mật khẩu cũ không đúng. Vui lòng kiểm tra lại.'
      } else if (error.code === 'PASSWORD_CHANGE_NOT_SUPPORTED') {
        submitError.value = 'Tài khoản này không hỗ trợ đổi mật khẩu (đăng nhập bằng Google).'
      } else {
        submitError.value = error.message
      }
    } else if (error instanceof Error) {
      submitError.value = error.message
    } else {
      submitError.value = 'Đổi mật khẩu thất bại.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <MeAccountLayout active="changePassword">
    <div class="cp-root">

      <!-- Header card -->
      <div class="cp-header">
        <div class="cp-header-icon">
          <i class="pi pi-lock"></i>
        </div>
        <div style="display:flex;align-items:flex-start;gap:10px;flex:1;">
          <div>
            <div class="cp-header-title">Đổi mật khẩu</div>
            <div class="cp-header-sub">Cập nhật mật khẩu để bảo vệ tài khoản {{ accountRoleLabel }} của bạn</div>
          </div>
          <HintIcon
            placement="bottom"
            content="Để đổi mật khẩu bạn cần nhập mật khẩu hiện tại để xác minh danh tính. Mật khẩu mới phải đủ mạnh: tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
          />
        </div>
      </div>

      <!-- Banners -->
      <transition name="slide-down">
        <div v-if="submitSuccess" class="cp-banner cp-banner--success">
          <i class="pi pi-check-circle banner-icon"></i>
          <div>
            <div class="banner-title">Thành công!</div>
            <div class="banner-sub">{{ submitSuccess }}</div>
          </div>
        </div>
      </transition>
      <transition name="slide-down">
        <div v-if="submitError" class="cp-banner cp-banner--error">
          <i class="pi pi-times-circle banner-icon"></i>
          <div>
            <div class="banner-title">Có lỗi xảy ra</div>
            <div class="banner-sub">{{ submitError }}</div>
          </div>
        </div>
      </transition>

      <!-- Form -->
      <form @submit.prevent="submit" class="cp-form">

        <!-- Old password -->
        <div class="cp-field">
          <label class="cp-label">
            <i class="pi pi-key"></i> Mật khẩu hiện tại
          </label>
          <div class="cp-input-wrap" :class="{ 'is-error': oldPasswordError }">
            <i class="pi pi-lock input-prefix-icon"></i>
            <input
              v-model="oldPassword"
              :type="showOld ? 'text' : 'password'"
              autocomplete="current-password"
              class="cp-input"
              placeholder="Nhập mật khẩu hiện tại"
              @blur="touched.old = true"
            />
            <button type="button" class="eye-btn" @click="showOld = !showOld" tabindex="-1">
              <i :class="showOld ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
          <transition name="err-fade">
            <div v-if="oldPasswordError" class="cp-error">
              <i class="pi pi-exclamation-circle"></i> {{ oldPasswordError }}
            </div>
          </transition>
        </div>

        <div class="cp-sep"></div>

        <!-- New password -->
        <div class="cp-field">
          <label class="cp-label">
            <i class="pi pi-lock-open"></i> Mật khẩu mới
          </label>
          <div class="cp-input-wrap" :class="{ 'is-error': newPasswordError }">
            <i class="pi pi-lock-open input-prefix-icon"></i>
            <input
              v-model="newPassword"
              :type="showNew ? 'text' : 'password'"
              autocomplete="new-password"
              class="cp-input"
              placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
              @blur="touched.new = true"
            />
            <button type="button" class="eye-btn" @click="showNew = !showNew" tabindex="-1">
              <i :class="showNew ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>

          <!-- Strength bar -->
          <div v-if="newPassword && strengthInfo" class="strength-wrap">
            <div class="strength-track">
              <div class="strength-fill" :style="{ width: strengthInfo.width, background: strengthInfo.color }"></div>
            </div>
            <span class="strength-text" :style="{ color: strengthInfo.color }">{{ strengthInfo.text }}</span>
            <HintIcon
              placement="right"
              content="Độ mạnh mật khẩu được tính dựa trên: độ dài (≥8 ký tự), chữ hoa, chữ thường, số và ký tự đặc biệt (@#$%...). Càng đáp ứng nhiều tiêu chí, mật khẩu càng an toàn."
            />
          </div>

          <transition name="err-fade">
            <div v-if="newPasswordError" class="cp-error">
              <i class="pi pi-exclamation-circle"></i> {{ newPasswordError }}
            </div>
          </transition>
        </div>

        <!-- Confirm password -->
        <div class="cp-field">
          <label class="cp-label">
            <i class="pi pi-check-square"></i> Xác nhận mật khẩu mới
          </label>
          <div class="cp-input-wrap" :class="{ 'is-error': confirmPasswordError, 'is-valid': confirmMatch }">
            <i class="pi pi-check-square input-prefix-icon"></i>
            <input
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              autocomplete="new-password"
              class="cp-input"
              placeholder="Nhập lại mật khẩu mới"
              @blur="touched.confirm = true"
            />
            <button type="button" class="eye-btn" @click="showConfirm = !showConfirm" tabindex="-1">
              <i :class="showConfirm ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
          <transition name="err-fade">
            <div v-if="confirmPasswordError" class="cp-error">
              <i class="pi pi-exclamation-circle"></i> {{ confirmPasswordError }}
            </div>
          </transition>
          <transition name="err-fade">
            <div v-if="confirmMatch" class="cp-hint-ok">
              <i class="pi pi-check-circle"></i> Mật khẩu khớp
            </div>
          </transition>
        </div>

        <!-- Requirements checklist -->
        <div class="cp-reqs">
          <div class="reqs-title">Yêu cầu mật khẩu</div>
          <div class="reqs-grid">
            <div class="req-item" :class="{ met: newPassword.length >= 8 }">
              <i :class="newPassword.length >= 8 ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
              Ít nhất 8 ký tự
            </div>
            <div class="req-item" :class="{ met: /[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword) }">
              <i :class="/[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword) ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
              Có chữ cái và số
            </div>
            <div class="req-item" :class="{ met: newPassword.length > 0 && !/\s/.test(newPassword) }">
              <i :class="newPassword.length > 0 && !/\s/.test(newPassword) ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
              Không có khoảng trắng
            </div>
            <div class="req-item" :class="{ met: !!newPassword && !!oldPassword && newPassword !== oldPassword }">
              <i :class="newPassword && oldPassword && newPassword !== oldPassword ? 'pi pi-check-circle' : 'pi pi-circle'"></i>
              Khác mật khẩu cũ
            </div>
          </div>
        </div>

        <!-- Submit -->
        <button type="submit" class="cp-submit" :disabled="!canSubmit">
          <span v-if="submitting" class="btn-spinner"></span>
          <i v-else class="pi pi-lock"></i>
          {{ submitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu' }}
        </button>

      </form>
    </div>
  </MeAccountLayout>
</template>

<style scoped>
.cp-root {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Header */
.cp-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 22px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}
.cp-header-icon {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-sm);
  background: var(--grad-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  box-shadow: var(--shadow-glow);
  flex-shrink: 0;
}
.cp-header-title {
  font-size: 17px;
  font-weight: 900;
  color: var(--c-text);
  line-height: 1.2;
}
.cp-header-sub {
  font-size: 12px;
  color: var(--c-text-mute);
  font-weight: 500;
  margin-top: 3px;
}

/* Banners */
.cp-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
}
.cp-banner--success {
  background: #ecfdf5;
  border-color: #bbf7d0;
  color: #065f46;
}
.cp-banner--error {
  background: #fff1f0;
  border-color: #fecaca;
  color: #b42318;
}
.banner-icon { font-size: 20px; flex-shrink: 0; }
.banner-title { font-size: 14px; font-weight: 800; }
.banner-sub { font-size: 12px; opacity: 0.8; margin-top: 2px; }

/* Form container */
.cp-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #fff;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-xs);
}

.cp-sep {
  height: 1px;
  background: var(--c-border);
}

/* Field */
.cp-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.cp-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 800;
  color: var(--c-text-soft);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.cp-label .pi { color: var(--c-blue-500); font-size: 12px; }

/* Input wrap */
.cp-input-wrap {
  display: flex;
  align-items: center;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--c-border);
  background: var(--c-bg-soft);
  transition: border-color .2s, box-shadow .2s;
  overflow: hidden;
}
.cp-input-wrap:focus-within {
  border-color: var(--c-blue-300);
  box-shadow: 0 0 0 3px var(--c-blue-50);
  background: #fff;
}
.cp-input-wrap.is-error {
  border-color: #fca5a5;
  box-shadow: 0 0 0 3px #fff1f0;
}
.cp-input-wrap.is-valid {
  border-color: #86efac;
  box-shadow: 0 0 0 3px #f0fdf4;
}

.input-prefix-icon {
  padding: 0 12px;
  color: var(--c-text-mute);
  font-size: 13px;
  flex-shrink: 0;
}
.cp-input {
  flex: 1;
  height: 46px;
  padding: 0 4px 0 0;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
  font-family: inherit;
}
.cp-input::placeholder { color: var(--c-text-mute); font-weight: 400; }

.eye-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-mute);
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 0;
  transition: color .2s;
  flex-shrink: 0;
}
.eye-btn:hover { color: var(--c-blue-500); }

/* Strength */
.strength-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.strength-track {
  flex: 1;
  height: 4px;
  background: var(--c-bg-mute);
  border-radius: 4px;
  overflow: hidden;
}
.strength-fill {
  height: 100%;
  border-radius: 4px;
  transition: width .4s var(--ease-out), background .3s;
}
.strength-text {
  font-size: 11px;
  font-weight: 800;
  min-width: 64px;
  text-align: right;
  transition: color .3s;
}

/* Validation messages */
.cp-error {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  color: #ef4444;
}
.cp-hint-ok {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  color: #22c55e;
}

/* Requirements */
.cp-reqs {
  background: var(--c-bg-soft);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
}
.reqs-title {
  font-size: 11px;
  font-weight: 800;
  color: var(--c-text-mute);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.reqs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.req-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text-mute);
  transition: color .2s;
}
.req-item .pi { font-size: 12px; color: var(--c-border-strong); transition: color .2s; }
.req-item.met { color: #22c55e; }
.req-item.met .pi { color: #22c55e; }

/* Submit */
.cp-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 50px;
  border-radius: var(--radius-full);
  background: var(--grad-brand);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  border: none;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: transform .2s var(--ease-out), box-shadow .2s var(--ease-out), opacity .2s;
  box-shadow: var(--shadow-glow);
  margin-top: 4px;
  font-family: inherit;
}
.cp-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 18px 50px rgba(20,184,166,0.35);
}
.cp-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Transitions */
.slide-down-enter-active, .slide-down-leave-active { transition: all .25s var(--ease-out); }
.slide-down-enter-from { opacity: 0; transform: translateY(-6px); }
.slide-down-leave-to { opacity: 0; transform: translateY(-4px); }

.err-fade-enter-active, .err-fade-leave-active { transition: all .2s; }
.err-fade-enter-from { opacity: 0; transform: translateY(-3px); }
.err-fade-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .reqs-grid { grid-template-columns: 1fr; }
  .cp-form { padding: 18px; }
}
</style>
