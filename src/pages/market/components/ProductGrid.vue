<script setup lang="ts">
import type { ProductListItem } from '../../../modules/catalog/types'
import MarketProductCard from './MarketProductCard.vue'

defineProps<{
  items: ProductListItem[]
  rawProducts?: any[]
}>()
</script>

<template>
  <div class="pgrid">
    <MarketProductCard
      v-for="it in items"
      :key="it.id"
      :item="it"
      :raw-product="rawProducts?.find(r => r.isrc === it.productCode || `PROD-${String(r.id).slice(0, 6).padStart(6, '0')}` === it.productCode)"
    />
  </div>
</template>

<style scoped>
.pgrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
@media (max-width: 1280px) {
  .pgrid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 980px) {
  .pgrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .pgrid { grid-template-columns: 1fr; }
}
</style>
