<script setup lang="ts">
defineOptions({ inheritAttrs: false })
</script>

<template>
  <li v-bind="$attrs">
    <slot />
  </li>
</template>
