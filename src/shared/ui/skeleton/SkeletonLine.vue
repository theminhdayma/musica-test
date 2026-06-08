<script setup lang="ts">
withDefaults(defineProps<{ width?: string; height?: string }>(), {
  width: '100%',
  height: '12px'
})
</script>

<template>
  <div
    :style="{
      width,
      height,
      borderRadius: '999px',
      background: 'linear-gradient(90deg, rgba(15,23,42,0.06), rgba(15,23,42,0.10), rgba(15,23,42,0.06))',
      backgroundSize: '220% 100%',
      animation: 'skeleton 1.2s ease-in-out infinite'
    }"
  ></div>
</template>

<style scoped>
@keyframes skeleton {
  0% { background-position: 0% 0; }
  100% { background-position: 220% 0; }
}
</style>

