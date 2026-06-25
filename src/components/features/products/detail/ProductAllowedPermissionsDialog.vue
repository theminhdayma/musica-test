<script setup lang="ts">
import { computed } from 'vue'
import Dialog from 'primevue/dialog'

type PermissionOption = {
  id: string
  name: string
  lawReference: string
}

const props = defineProps<{
  visible: boolean
  trackTitle: string | null
  detailStatusLabel: string
  permissionOptions: PermissionOption[]
  selectedPermissionIds: string[]
  loading?: boolean
  saving: boolean
  canSave: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'toggle-permission': [permissionId: string]
  save: []
}>()

const selectedCount = computed(() => props.permissionOptions.filter((p) => props.selectedPermissionIds.includes(p.id)).length)

const isSelected = (id: string) => props.selectedPermissionIds.includes(id)
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    class="w-[calc(100vw-0.75rem)] sm:w-[min(680px,96vw)]"
    :draggable="false"
    :pt="{
      header: { class: 'border-b px-6 pt-5 pb-4 [border-color:var(--admin-border)]' },
      content: { class: 'px-6 py-5 overflow-y-auto max-h-[calc(100svh-12rem)]' },
      footer: { class: 'border-t px-6 py-4 [border-color:var(--admin-border)]' },
    }"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
      <div class="min-w-0">
        <div class="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--admin-primary-600)]">Quyền & Giấy phép</div>
        <div class="mt-1 text-base font-bold text-[color:var(--admin-text)]">Chọn quyền bán</div>
        <div v-if="trackTitle" class="mt-0.5 truncate text-sm text-[color:var(--admin-text-muted)]">
          {{ trackTitle }}
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <div class="flex items-start gap-3 rounded-xl border [border-color:var(--admin-border)] bg-[color:var(--admin-surface-1)] px-4 py-3">
        <i class="pi pi-info-circle mt-0.5 shrink-0 text-sm text-[color:var(--admin-text-muted)]" />
        <p class="text-xs leading-relaxed text-[color:var(--admin-text-muted)]">
          {{ detailStatusLabel }}
          <template v-if="!canSave">
            &nbsp;— Chỉ có thể chọn quyền khi hồ sơ pháp lý đã được duyệt đầy đủ.
          </template>
        </p>
      </div>

      <div v-if="loading" class="space-y-2.5">
        <div v-for="i in 3" :key="i" class="h-[68px] animate-pulse rounded-xl bg-[color:var(--admin-surface-1)]" />
      </div>

      <div
        v-else-if="permissionOptions.length === 0"
        class="rounded-xl border border-dashed [border-color:var(--admin-border)] bg-[color:var(--admin-surface-1)] px-6 py-10 text-center"
      >
        <i class="pi pi-shield text-2xl text-[color:var(--admin-text-muted)]" />
        <p class="mt-3 text-sm font-semibold text-[color:var(--admin-text)]">Chưa có quyền nào được duyệt</p>
        <p class="mt-1 text-xs text-[color:var(--admin-text-muted)]">Hồ sơ pháp lý chưa có quyền nào được phê duyệt cho sản phẩm này.</p>
      </div>

      <div v-else class="space-y-2">
        <div class="flex items-center justify-between px-1">
          <span class="text-xs text-[color:var(--admin-text-muted)]">
            Đã chọn <span class="font-semibold text-[color:var(--admin-text)]">{{ selectedCount }}</span> / {{ permissionOptions.length }} quyền
          </span>
        </div>

        <button
          v-for="permission in permissionOptions"
          :key="permission.id"
          type="button"
          :disabled="saving || !canSave"
          class="group w-full rounded-xl border px-4 py-4 text-left transition-all"
          :class="isSelected(permission.id)
            ? 'border-[color:var(--admin-primary-400)] bg-[color:var(--admin-primary-50)]'
            : 'border-[color:var(--admin-border)] bg-[color:var(--admin-surface-0)] hover:border-[color:var(--admin-primary-200)] hover:bg-[color:var(--admin-surface-1)] disabled:cursor-not-allowed disabled:opacity-50'"
          @click="emit('toggle-permission', permission.id)"
        >
          <div class="flex items-start gap-3">
            <span
              class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all"
              :class="isSelected(permission.id)
                ? 'border-[color:var(--admin-primary-500)] bg-[color:var(--admin-primary-500)] text-white'
                : 'border-[color:var(--admin-border)] bg-[color:var(--admin-surface-0)] group-hover:border-[color:var(--admin-primary-300)]'"
            >
              <i v-if="isSelected(permission.id)" class="pi pi-check text-[9px]" />
            </span>

            <div class="min-w-0 flex-1">
              <p
                class="text-sm font-semibold leading-snug"
                :class="isSelected(permission.id) ? 'text-[color:var(--admin-primary-700)]' : 'text-[color:var(--admin-text)]'"
              >
                {{ permission.name }}
              </p>
              <p class="mt-0.5 text-xs leading-relaxed text-[color:var(--admin-text-muted)]">
                {{ permission.lawReference }}
              </p>
            </div>

            <span
              v-if="isSelected(permission.id)"
              class="shrink-0 rounded-full bg-[color:var(--admin-primary-100)] px-2 py-0.5 text-[10px] font-bold text-[color:var(--admin-primary-700)]"
            >
              Đã chọn
            </span>
          </div>
        </button>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full items-center justify-between gap-3">
        <span class="text-xs text-[color:var(--admin-text-muted)]">
          <template v-if="loading">Đang tải hồ sơ...</template>
          <template v-else-if="!canSave">Không thể lưu — hồ sơ chưa đủ điều kiện</template>
          <template v-else>{{ selectedCount }} / {{ permissionOptions.length }} quyền được chọn</template>
        </span>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg border bg-[color:var(--admin-surface-0)] px-4 py-2 text-sm font-semibold text-[color:var(--admin-text)] transition [border-color:var(--admin-border)] hover:bg-[color:var(--admin-surface-1)]"
            @click="emit('update:visible', false)"
          >
            Đóng
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg bg-[color:var(--admin-primary-600)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--admin-primary-700)] disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!canSave || saving || loading"
            @click="emit('save')"
          >
            <i v-if="saving" class="pi pi-spin pi-spinner mr-2 text-xs" />
            {{ saving ? 'Đang lưu...' : 'Lưu quyền bán' }}
          </button>
        </div>
      </div>
    </template>
  </Dialog>
</template>
