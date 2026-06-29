<script setup>
import { useRoute } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import TourFab from './shared/ui/TourFab.vue'
import { useReveal } from './composables/useReveal'

const route = useRoute()
useReveal()
</script>

<template>
  <div class="app-shell">
    <AppHeader v-if="!route.meta.hideHeaderFooter" />
    <main>
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.name === 'search' ? 'search' : (route.name === 'product' ? route.path : route.fullPath)" />
        </transition>
      </router-view>
    </main>
    <AppFooter v-if="!route.meta.hideHeaderFooter" />
    <TourFab v-if="!route.meta.hideHeaderFooter" />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main { flex: 1; }
</style>
