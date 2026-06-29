<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    as?: string
    isActive?: boolean
  }>(),
  {
    as: 'button',
    isActive: false,
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
