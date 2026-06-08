<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    items: { id: string; label: string }[]
    active: string
    expanded?: boolean
  }>(),
  { expanded: false }
)

const emit = defineEmits<{ select: [string] }>()

const open = ref(!!props.expanded)
watch(
  () => props.expanded,
  (v) => {
    if (v) open.value = true
  }
)

const visible = computed(() => (open.value ? props.items : props.items.slice(0, 8)))
</script>

<template>
  <div class="card section">
    <div class="head">
      <div style="font-weight: 900;">Thể loại</div>
      <button v-if="!expanded" class="link" type="button" @click="open = !open">{{ open ? 'Thu gọn' : 'Xem thêm' }}</button>
    </div>
    <div class="chips">
      <button class="chip" type="button" :data-active="active === 'all'" @click="emit('select', 'all')">Tất cả</button>
      <button v-for="it in visible" :key="it.id" class="chip" type="button" :data-active="active === it.id" @click="emit('select', it.id)">
        {{ it.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.section { padding: 14px; }
.head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.link {
  border: none;
  background: transparent;
  color: var(--c-text-mute);
  font-weight: 900;
}
.link:hover { text-decoration: underline; }
.chips { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  border-radius: 999px;
  padding: 8px 12px;
  border: 1px solid var(--c-border);
  background: var(--c-bg-mute);
  color: var(--c-text-soft);
  font-weight: 900;
  font-size: 13px;
}
.chip:hover { text-decoration: underline; text-underline-offset: 3px; }
.chip[data-active="true"] {
  background: var(--grad-brand);
  border-color: transparent;
  color: #fff;
}
</style>
