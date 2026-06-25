<script setup lang="ts">
import Dialog from 'primevue/dialog'
import type { PricingPlatformRequiredPermission, PricingPlatformType } from '@/modules/pricing/types'

type AvailablePlatform = {
  type: PricingPlatformType
  name: string
  isEligible: boolean
  requiredPermissions: PricingPlatformRequiredPermission[]
  missingRequiredPermissions: PricingPlatformRequiredPermission[]
}

const props = defineProps<{
  visible: boolean
  platforms: AvailablePlatform[]
  actionLoading: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  join: [platformType: PricingPlatformType]
}>()
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    class="w-[calc(100vw-0.75rem)] sm:w-[min(560px,92vw)]"
    :pt="{
      header: { class: 'px-6 pt-6 pb-4' },
      content: { class: 'px-6 pb-6 max-h-[calc(100svh-12rem)] overflow-y-auto' },
      footer: { class: 'border-t px-6 py-4 [border-color:var(--admin-border)]' },
    }"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
      <div>
        <div class="text-base font-bold text-[color:var(--admin-text)]">Thêm nền tảng tính giá</div>
        <div class="mt-1 text-sm text-[color:var(--admin-text-muted)]">
          Chọn nền tảng để bắt đầu cấu hình bảng giá cho sản phẩm.
        </div>
      </div>
    </template>

    <div class="space-y-3">
      <div
        v-if="platforms.length === 0"
        class="rounded-xl border border-dashed [border-color:var(--admin-border)] bg-[color:var(--admin-surface-1)] px-4 py-8 text-center text-sm text-[color:var(--admin-text-muted)]"
      >
        Tất cả nền tảng khả dụng đã được thêm cho sản phẩm này.
      </div>

      <article
        v-for="platform in platforms"
        :key="platform.type"
        class="rounded-xl border [border-color:var(--admin-border)] bg-[color:var(--admin-surface-1)] p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-[color:var(--admin-text)]">{{ platform.name }}</div>
            <div class="mt-1 text-xs text-[color:var(--admin-text-muted)]">
              {{
                platform.requiredPermissions.length > 0
                  ? `${platform.requiredPermissions.length} quyền cốt lõi bắt buộc`
                  : 'Không ràng buộc quyền cốt lõi'
              }}
            </div>
          </div>
          <span
            class="shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
            :class="platform.isEligible
              ? 'bg-[color:var(--admin-success-50)] text-[color:var(--admin-success-700)]'
              : 'bg-[color:var(--admin-warning-50)] text-[color:var(--admin-warning-700)]'"
          >
            {{ platform.isEligible ? 'Đủ điều kiện' : `Thiếu ${platform.missingRequiredPermissions.length} quyền` }}
          </span>
        </div>

        <div v-if="platform.requiredPermissions.length > 0" class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="permission in platform.requiredPermissions"
            :key="`${platform.type}-${permission.id}`"
            class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
            :class="platform.missingRequiredPermissions.some((item) => item.id === permission.id)
              ? 'border-[color:var(--admin-warning-300)] bg-[color:var(--admin-warning-50)] text-[color:var(--admin-warning-700)]'
              : 'border-[color:rgb(var(--admin-success-rgb)/0.24)] bg-[color:var(--admin-success-50)] text-[color:var(--admin-success-700)]'"
          >
            {{ permission.name }}
          </span>
        </div>

        <div v-if="!platform.isEligible" class="mt-3 text-xs text-[color:var(--admin-text-muted)]">
          Sản phẩm cần được cấp đủ quyền cốt lõi ở tab "Quyền và giấy phép" trước khi tham gia nền tảng này.
        </div>

        <div class="mt-4 flex justify-end">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-[color:var(--admin-primary-600)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--admin-primary-700)] disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="actionLoading || !platform.isEligible"
            @click="emit('join', platform.type)"
          >
            <i class="pi pi-plus text-xs" />
            Thêm {{ platform.name }}
          </button>
        </div>
      </article>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg border bg-[color:var(--admin-surface-0)] px-4 py-2 text-sm font-semibold text-[color:var(--admin-text)] transition [border-color:var(--admin-border)] hover:bg-[color:var(--admin-surface-1)]"
          @click="emit('update:visible', false)"
        >
          Đóng
        </button>
      </div>
    </template>
  </Dialog>
</template>
