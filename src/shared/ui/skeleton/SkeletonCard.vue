<script setup lang="ts">
import SkeletonLine from './SkeletonLine.vue'
</script>

<template>
  <div class="card">
    <div style="display: flex; gap: 12px; align-items: center;">
      <div style="width: 56px; height: 56px; border-radius: 14px; background: rgba(15,23,42,0.08);"></div>
      <div style="flex: 1; display: grid; gap: 8px;">
        <SkeletonLine width="70%" />
        <SkeletonLine width="45%" height="10px" />
      </div>
    </div>
  </div>
</template>

