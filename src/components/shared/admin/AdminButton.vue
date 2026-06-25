<script setup lang="ts">
import { computed, useAttrs } from 'vue'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    variant: 'secondary',
    size: 'md',
    type: 'button',
    disabled: false,
    loading: false,
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const attrs = useAttrs()

const className = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--admin-ring)] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60'

  const sizeClassMap: Record<Size, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
  }

  const variantClassMap: Record<Variant, string> = {
    primary:
      'border border-transparent bg-[color:var(--admin-primary-button-bg)] text-[color:var(--admin-primary-button-text)] shadow-sm hover:bg-[color:var(--admin-primary-button-hover)] active:bg-[color:var(--admin-primary-button-active)]',
    secondary:
      'border bg-[color:var(--admin-surface-0)] text-[color:var(--admin-text)] shadow-sm [border-color:var(--admin-border)] hover:bg-[color:var(--admin-surface-2)] hover:border-[color:var(--admin-border-strong)]',
    ghost: 'text-[color:var(--admin-text)] hover:bg-[color:var(--admin-surface-2)]',
    danger:
      'border border-transparent bg-[color:var(--admin-danger-500)] text-white shadow-sm hover:bg-[color:var(--admin-danger-700)]',
  }

  return [base, sizeClassMap[props.size], variantClassMap[props.variant], attrs.class]
})

const isDisabled = computed(() => props.disabled || props.loading)
</script>

<template>
  <button :type="props.type" :disabled="isDisabled" :class="className" @click="emit('click', $event)">
    <i v-if="props.loading" class="pi pi-spin pi-spinner text-xs" />
    <slot />
  </button>
</template>

