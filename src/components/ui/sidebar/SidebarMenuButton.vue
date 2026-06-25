<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    as?: string
    isActive?: boolean
    size?: 'sm' | 'md' | 'lg' | string
  }>(),
  {
    as: 'button',
    isActive: false,
    size: 'md',
  },
)

const attrs = useAttrs()
const componentTag = computed(() => props.as || 'button')
</script>

<template>
  <component :is="componentTag" v-bind="attrs">
    <slot />
  </component>
</template>
