<script setup lang="ts">
import ProductView from '../../views/ProductView.vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'

const route = useRoute()
const id = String(route.params.id || '')

useHead({
  title: id ? `Tác phẩm ${id} — MusicA` : 'Chi tiết tác phẩm — MusicA',
  meta: [
    {
      name: 'description',
      content: 'Xem chi tiết tác phẩm và cấu hình gói tác quyền phù hợp nhu cầu sử dụng.'
    }
  ]
})
</script>

<template>
  <ProductView />
</template>
