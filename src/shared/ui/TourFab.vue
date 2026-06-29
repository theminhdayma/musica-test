<script setup lang="ts">
import { useArtistTour } from '../../composables/useArtistTour'

const tour = useArtistTour()
const startTour = tour.startTour
const isTourActive = tour.isTourActive
</script>

<template>
  <button
    type="button"
    class="tour-fab"
    :class="{ 'tour-fab--active': isTourActive }"
    :aria-label="isTourActive ? 'Đang hướng dẫn...' : 'Bắt đầu hướng dẫn sử dụng'"
    :disabled="isTourActive"
    @click="startTour"
  >
    <svg
      v-if="!isTourActive"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
    <!-- Spinner khi tour đang chạy -->
    <svg
      v-else
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.2"
      stroke-linecap="round"
      aria-hidden="true"
      class="tour-fab-spinner"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
    <span class="tour-fab-label">{{ isTourActive ? 'Đang hướng dẫn' : 'Hướng dẫn' }}</span>
  </button>
</template>

<style scoped>
.tour-fab {
  position: fixed;
  bottom: 28px;
  right: 24px;
  z-index: 1000;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px 12px 14px;
  background: var(--grad-brand);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-family: var(--font-sans, 'Plus Jakarta Sans', system-ui, sans-serif);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(31, 109, 240, 0.35);
  transition:
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.2s,
    opacity 0.2s;
  animation: fab-slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.tour-fab:hover:not(:disabled) {
  transform: scale(1.06) translateY(-2px);
  box-shadow: 0 12px 40px rgba(20, 184, 166, 0.3), 0 4px 20px rgba(31, 109, 240, 0.35);
}

.tour-fab:active:not(:disabled) {
  transform: scale(0.97);
}

.tour-fab:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

.tour-fab--active {
  opacity: 0.8;
  cursor: default;
}

.tour-fab-label {
  white-space: nowrap;
}

.tour-fab-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fab-slide-in {
  from {
    opacity: 0;
    transform: translateX(80px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 480px) {
  .tour-fab-label {
    display: none;
  }
  .tour-fab {
    padding: 14px;
    border-radius: 50%;
  }
}
</style>
