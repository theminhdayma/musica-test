<script setup lang="ts">
import HomeView from '../../views/HomeView.vue'
import { useHead } from '@unhead/vue'

useHead({
  title: 'MusicA — Thương mại điện tử tác quyền âm nhạc',
  meta: [
    {
      name: 'description',
      content: 'Giao dịch tác quyền âm nhạc minh bạch, linh hoạt, hợp pháp. Mua tác quyền trực tiếp từ nghệ sĩ.'
    }
  ]
})
</script>

<template>
  <HomeView />
</template>
