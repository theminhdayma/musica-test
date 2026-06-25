<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import type { ProductPlatform } from '@/modules/pricing/types'

type ProductDetailSectionKey = 'general' | 'rights-license' | 'pricing'

const props = defineProps<{
  activeSection: ProductDetailSectionKey
  pricingPlatforms?: ProductPlatform[]
  selectedPricingPlatformId?: string | null
}>()

const emit = defineEmits<{
  back: []
  navigate: [section: ProductDetailSectionKey]
  selectPricingPlatform: [platformId: string]
  openJoinPlatform: []
}>()

const items: Array<{
  key: ProductDetailSectionKey
  label: string
  icon: string
}> = [
  {
    key: 'general',
    label: 'Thông tin chung',
    icon: 'pi pi-file-edit',
  },
  {
    key: 'rights-license',
    label: 'Quyền và giấy phép',
    icon: 'pi pi-book',
  },
  {
    key: 'pricing',
    label: 'Bảng giá',
    icon: 'pi pi-calculator',
  },
]

const isSectionActive = (sectionKey: ProductDetailSectionKey) => props.activeSection === sectionKey

const getPlatformDisplayName = (platform: ProductPlatform) => platform.platformName || String(platform.platformType || '').toUpperCase()

const activePricingPlatforms = () => (props.pricingPlatforms ?? []).filter((p) => !p.deletedAt)
</script>

<template>
  <Sidebar
    side="left"
    variant="sidebar"
    collapsible="none"
    class="sticky top-0 h-screen border-r border-[color:var(--admin-border)] bg-[color:var(--admin-surface-0)] text-[color:var(--admin-text)] shadow-sm shrink-0"
  >
    <SidebarHeader class="border-b px-4 py-4" style="border-color: var(--admin-border)">
      <button
        type="button"
        class="inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-[color:var(--admin-surface-2)]"
        style="border-color: var(--admin-border); background: var(--admin-surface-1); color: var(--admin-text)"
        @click="emit('back')"
      >
        <i class="pi pi-arrow-left text-xs" />
        Quay lại danh sách
      </button>
    </SidebarHeader>

    <SidebarContent class="gap-0 px-3 py-4">
      <SidebarGroup class="p-0">
        <SidebarGroupLabel class="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest" style="color: var(--admin-text-muted)">
          Điều hướng
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu class="flex flex-col gap-3">
            <SidebarMenuItem
              v-for="item in items"
              :key="item.key"
            >
              <SidebarMenuButton
                type="button"
                size="lg"
                :is-active="isSectionActive(item.key)"
                class="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left shadow-none transition-colors"
                :class="isSectionActive(item.key)
                  ? 'bg-[color:var(--admin-sidebar-active-bg)] text-white'
                  : 'text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-sidebar-hover-bg)] hover:text-[color:var(--admin-text)]'"
                @click="emit('navigate', item.key)"
              >
                <span class="flex h-5 w-5 shrink-0 items-center justify-center text-base">
                  <i :class="item.icon" />
                </span>
                <span class="min-w-0 truncate text-sm font-semibold">{{ item.label }}</span>
              </SidebarMenuButton>

              <SidebarMenuSub v-if="item.key === 'pricing' && isSectionActive('pricing') && (pricingPlatforms ?? []).length > 0">
                <div class="mt-2" />
                <SidebarMenuSubItem
                  v-for="platform in activePricingPlatforms()"
                  :key="platform.id"
                >
                  <SidebarMenuSubButton
                    as="button"
                    type="button"
                    :is-active="selectedPricingPlatformId === platform.id"
                    class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition"
                    :class="selectedPricingPlatformId === platform.id
                      ? 'bg-[color:var(--admin-primary-50)] text-[color:var(--admin-primary-700)] font-semibold'
                      : 'text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-surface-1)] hover:text-[color:var(--admin-text)]'"
                    @click="emit('selectPricingPlatform', platform.id)"
                  >
                    <span
                      class="h-1.5 w-1.5 shrink-0 rounded-full"
                      :class="selectedPricingPlatformId === platform.id ? 'bg-[color:var(--admin-primary-500)]' : 'bg-[color:var(--admin-success-500)]'"
                    />
                    <span class="min-w-0 truncate text-xs">{{ getPlatformDisplayName(platform) }}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>

                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    as="button"
                    type="button"
                    class="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[color:var(--admin-primary-600)] transition hover:bg-[color:var(--admin-primary-50)]"
                    @click="emit('openJoinPlatform')"
                  >
                    <i class="pi pi-plus text-[10px]" />
                    <span class="text-xs font-semibold">Thêm nền tảng</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>
