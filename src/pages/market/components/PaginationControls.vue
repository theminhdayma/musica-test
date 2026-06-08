<script setup lang="ts">
defineProps<{
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}>()

const emit = defineEmits<{ change: [number] }>()
</script>

<template>
  <div class="pager">
    <button class="btn btn-ghost btn-sm" type="button" :disabled="!pagination.hasPrevPage" @click="emit('change', pagination.page - 1)">Trước</button>
    <div class="muted">Trang {{ pagination.page }} / {{ pagination.totalPages }}</div>
    <button class="btn btn-ghost btn-sm" type="button" :disabled="!pagination.hasNextPage" @click="emit('change', pagination.page + 1)">Sau</button>
  </div>
</template>

<style scoped>
.pager {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}
</style>

