<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  side?: 'left' | 'right'
  variant?: 'sidebar' | string
  collapsible?: 'none' | 'icon' | string
}>()
</script>

<template>
  <aside v-bind="$attrs">
    <slot />
  </aside>
</template>
