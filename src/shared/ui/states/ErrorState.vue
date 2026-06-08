<script setup lang="ts">
defineProps<{
  title?: string
  message: string
  requestId?: string | null
  canRetry?: boolean
}>()

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="card" style="background: #fff1f2; border-color: #fecdd3;">
    <div style="font-weight: 800;">{{ title || 'Đã có lỗi xảy ra' }}</div>
    <div class="muted" style="margin-top: 6px;">{{ message }}</div>
    <div v-if="requestId" class="muted" style="margin-top: 6px;">Request ID: {{ requestId }}</div>
    <button v-if="canRetry" class="btn btn-ghost btn-sm" type="button" style="margin-top: 12px;" @click="emit('retry')">Thử lại</button>
  </div>
</template>

