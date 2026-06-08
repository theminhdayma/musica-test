<script setup>
import logoSrc from '../../../ui-source/system/Musica-logo.png'

defineProps({
  size: { type: Number, default: 34 }
})
</script>

<template>
  <div class="brand" :style="{ height: size + 'px' }">
    <img :src="logoSrc" alt="MusicA" :height="size" />
  </div>
</template>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
}

.brand img {
  display: block;
  height: 100%;
  width: auto;
  object-fit: contain;
}
</style>
