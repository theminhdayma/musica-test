<script setup lang="ts">
defineProps<{
  modelValue: string
  options: { id: string; label: string }[]
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <label class="filter">
    <span class="muted" style="font-size: 12px; font-weight: 700;">Thể loại</span>
    <select class="select" :value="modelValue" @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
      <option v-for="o in options" :key="o.id" :value="o.id">{{ o.label }}</option>
    </select>
  </label>
</template>

<style scoped>
.filter {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--c-surface);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  border: 1px solid var(--c-border);
  box-shadow: var(--shadow-sm);
}
.select {
  border: none;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--c-text);
  padding: 8px 6px;
}
</style>

