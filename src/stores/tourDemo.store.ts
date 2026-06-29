import { defineStore } from 'pinia'
import type { MyProductDetail } from '../modules/me-products/types'

// Product demo với đầy đủ dữ liệu hiển thị
export const DEMO_PRODUCT_ID = 'tour_demo_product'

export const DEMO_PRODUCT: MyProductDetail = {
  id: DEMO_PRODUCT_ID,
  title: 'Cánh Đồng Ký Ức (Demo)',
  thumbnailUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80',
  status: 'PENDING',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  artistId: 'demo_artist',
  authorName: 'Nghệ sĩ Demo',
  genres: ['POP', 'FOLK'],
  useCases: ['VLOG', 'ADVERTISEMENT'],
  duration: 213,
  description: 'Bản nhạc mẫu dùng cho trải nghiệm hướng dẫn. Bài hát mang âm hưởng nhẹ nhàng, thích hợp cho các video cảm xúc và quảng cáo thương hiệu.',
  allowedPermissionIds: ['perm_stream', 'perm_download_personal'],
}

export type TourDemoState = {
  active: boolean
  demoProduct: MyProductDetail | null
  originPath: string
  guestDemoRoles: ('ARTIST')[]
}

export const useTourDemoStore = defineStore('tourDemo', {
  state: (): TourDemoState => ({
    active: false,
    demoProduct: null,
    originPath: '/',
    guestDemoRoles: [],
  }),

  getters: {
    isDemo: (state) => state.active,
    demoProductId: (state) => state.demoProduct?.id ?? null,
    // Các route /me/* mà demo được phép truy cập khi chưa đăng nhập
    allowedDemoPaths: () => ['/me/dashboard', '/me/products'],
  },

  actions: {
    startDemo(originPath: string) {
      this.active = true
      this.originPath = originPath
      this.demoProduct = { ...DEMO_PRODUCT, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      this.guestDemoRoles = ['ARTIST']
    },

    clearDemo() {
      this.active = false
      this.demoProduct = null
      this.originPath = '/'
      this.guestDemoRoles = []
    },
  },
})
