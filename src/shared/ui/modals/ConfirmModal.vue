<script setup>
import BaseModal from './BaseModal.vue'

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Xác nhận' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Đồng ý' },
  cancelText: { type: String, default: 'Đóng' }
})

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <BaseModal :open="open" :title="title" @close="$emit('close')">
    <div class="msg">{{ message }}</div>
    <template #footer>
      <button class="btn btn-ghost" type="button" @click="$emit('close')">{{ cancelText }}</button>
      <button class="btn btn-primary" type="button" @click="$emit('confirm')">{{ confirmText }}</button>
    </template>
  </BaseModal>
</template>

<style scoped>
.msg {
  color: var(--c-text-soft);
  line-height: 1.5;
  font-size: 14px;
}
</style>

