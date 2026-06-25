<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <ul v-bind="$attrs">
    <slot />
  </ul>
</template>
