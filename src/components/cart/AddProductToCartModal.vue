<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseModal from '../../shared/ui/modals/BaseModal.vue'
import { listProducts } from '../../modules/catalog/api'
import { ApiError } from '../../shared/api/errors'

const props = defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])
const router = useRouter()

const q = ref('')
const loading = ref(false)
const errorMessage = ref('')
const items = ref([])

const hasQuery = computed(() => q.value.trim().length > 0)

async function search() {
  const keyword = q.value.trim()
  errorMessage.value = ''
  items.value = []
  if (!keyword) return

  loading.value = true
  try {
    const res = await listProducts({ q: keyword, page: 1, pageSize: 12 })
    items.value = Array.isArray(res.data?.items) ? res.data.items : []
    if (!items.value.length) {
      errorMessage.value = 'Không tìm thấy tác phẩm phù hợp.'
    }
  } catch (err) {
    if (err instanceof ApiError) errorMessage.value = err.message || 'Không thể tìm kiếm.'
    else if (err instanceof Error) errorMessage.value = err.message || 'Không thể tìm kiếm.'
    else errorMessage.value = 'Không thể tìm kiếm.'
  } finally {
    loading.value = false
  }
}

function close() {
  emit('close')
}

function pick(productId) {
  close()
  router.push(`/product/${productId}`)
}

watch(() => props.open, (value) => {
  if (!value) return
  q.value = ''
  items.value = []
  errorMessage.value = ''
  loading.value = false
})

function getThumbStyle(url) {
  if (!url) return { background: 'var(--grad-brand)' }
  const trimmed = String(url).trim()
  if (trimmed.startsWith('http') || trimmed.startsWith('data:')) {
    return { backgroundImage: `url(${trimmed})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return { background: trimmed }
}
</script>

<template>
  <BaseModal :open="open" title="Thêm sản phẩm vào giỏ" @close="close">
    <div class="top">
      <input v-model="q" class="inp" placeholder="Nhập tên tác phẩm..." @keydown.enter.prevent="search" />
      <button class="btn btn-primary" type="button" :disabled="!hasQuery || loading" @click="search">
        {{ loading ? 'Đang tìm...' : 'Tìm' }}
      </button>
    </div>

    <div v-if="errorMessage" class="err">{{ errorMessage }}</div>

    <div v-if="items.length" class="grid">
      <button v-for="p in items" :key="p.id" class="row" type="button" @click="pick(p.id)">
        <div class="thumb" :style="getThumbStyle(p.thumbnailUrl)" aria-hidden="true"></div>
        <div class="meta">
          <div class="title">{{ p.title }}</div>
          <div class="sub muted">{{ p.artistDisplayName }}</div>
        </div>
        <div class="cta">Chọn →</div>
      </button>
    </div>

    <div v-else-if="!loading" class="hint muted">
      Chọn một tác phẩm để chuyển sang trang chi tiết và cấu hình biến thể trước khi thêm vào giỏ.
    </div>
  </BaseModal>
</template>

<style scoped>
.top {
  display: flex;
  gap: 10px;
}
.inp {
  flex: 1 1 auto;
  min-width: 0;
  height: 42px;
  border-radius: var(--radius-md);
  border: 1px solid var(--c-border);
  padding: 0 12px;
  background: #fff;
}
.inp:focus {
  outline: none;
  border-color: var(--c-teal-500);
}
.err {
  margin-top: 12px;
  padding: 12px 14px;
  border: 1px solid #fecaca;
  background: #fff1f2;
  color: #b91c1c;
  border-radius: var(--radius-md);
  font-size: 13px;
}
.grid {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.row {
  display: grid;
  grid-template-columns: 54px 1fr auto;
  gap: 12px;
  align-items: center;
  text-align: left;
  padding: 10px 12px;
  border-radius: var(--radius-lg);
  background: #fff;
  border: 1px solid var(--c-border);
}
.row:hover {
  border-color: var(--c-border-strong);
  box-shadow: var(--shadow-sm);
}
.thumb {
  width: 54px;
  height: 54px;
  border-radius: var(--radius-md);
  background: var(--c-bg-mute);
}
.title {
  font-weight: 800;
  letter-spacing: -0.01em;
}
.sub {
  font-size: 12.5px;
  margin-top: 2px;
}
.cta {
  font-weight: 700;
  color: var(--c-blue-700);
}
.hint {
  margin-top: 14px;
  font-size: 13px;
  line-height: 1.5;
}
</style>

