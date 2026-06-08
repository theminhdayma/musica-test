<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    items: { id: string; name: string }[]
    expanded?: boolean
  }>(),
  { expanded: false }
)

const open = ref(!!props.expanded)
watch(
  () => props.expanded,
  (v) => {
    if (v) open.value = true
  }
)

const visible = computed(() => (open.value ? props.items : props.items.slice(0, 6)))
</script>

<template>
  <div class="card section">
    <div class="head">
      <div style="font-weight: 900;">Nghệ sĩ</div>
      <button v-if="!expanded" class="link" type="button" @click="open = !open">{{ open ? 'Thu gọn' : 'Xem thêm' }}</button>
    </div>
    <div class="grid">
      <div v-for="a in visible" :key="a.id" class="artist">
        <div class="ava"></div>
        <div class="name">{{ a.name }}</div>
      </div>
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
.grid { margin-top: 12px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.artist { display: flex; gap: 10px; align-items: center; padding: 10px 12px; border-radius: 14px; border: 1px solid var(--c-border); background: var(--c-bg-mute); }
.ava { width: 34px; height: 34px; border-radius: 12px; background: var(--c-bg); border: 1px solid var(--c-border); }
.artist:hover .name { text-decoration: underline; }
.name { font-weight: 900; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@media (max-width: 980px) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
