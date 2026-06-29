<script setup>
defineProps({
  active: { type: Boolean, default: false },
  variant: { type: String, default: 'card' },
  icon: { type: [Object, Function], default: null },
  iconSize: { type: Number, default: null },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :class="[
      variant === 'seg' ? 'seg-btn' : 'big-card',
      { active, disabled }
    ]"
    @click="emit('click')"
  >
    <component
      v-if="icon"
      :is="icon"
      :width="iconSize || (variant === 'seg' ? 16 : 16)"
      :height="iconSize || (variant === 'seg' ? 16 : 16)"
      class="icon"
    />
    <span><slot /></span>
  </button>
</template>
