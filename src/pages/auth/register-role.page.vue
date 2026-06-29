<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowRight } from '@lucide/vue'
import { Button } from '../../components/ui/button'

const registerBannerUrl = new URL('../../shared/ui/images/auth/register-banner.png', import.meta.url).href

const router = useRouter()

function selectRole(role: 'buyer' | 'artist') {
  if (role === 'buyer') {
    router.push({ name: 'register-buyer' })
  } else {
    router.push({ name: 'register-artist' })
  }
}
</script>

<template>
  <div class="w-full overflow-x-hidden bg-background text-on-surface font-body-md text-sm">
    <div class="min-h-screen flex w-full flex-col md:flex-row">
      <div v-once class="w-full md:w-1/2 relative min-h-[300px] md:min-h-0 bg-surface-container">
        <img
          alt="Music Studio Hero"
          class="absolute inset-0 w-full h-full object-cover"
          decoding="async"
          fetchpriority="high"
          loading="eager"
          :src="registerBannerUrl"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent flex items-end p-8">
          <div class="text-white max-w-md">
            <h2 class="text-2xl md:text-3xl font-extrabold mb-3 font-sans">Âm nhạc kết nối tâm hồn.</h2>
            <p class="text-sm opacity-90 leading-relaxed">
              Tham gia cộng đồng những người sáng tạo và đam mê âm nhạc. Khám phá, giao dịch và bảo vệ bản quyền tác phẩm của bạn.
            </p>
          </div>
        </div>
      </div>

      <div class="w-full md:w-1/2 flex items-center justify-center bg-surface-container-lowest p-8 md:p-12">
        <div class="w-full max-w-sm">
          <div class="mb-5">
            <h1 class="text-3xl font-extrabold text-primary tracking-tight">MusicA</h1>
          </div>

          <div class="text-left mb-6">
            <h2 class="text-2xl font-bold mb-1">Chọn vai trò của bạn</h2>
            <p class="text-sm text-text-mute">Bạn muốn tham gia MusicA với tư cách nào?</p>
          </div>

          <div class="space-y-4">
            <Button
              @click="selectRole('buyer')"
              class="group min-h-[104px] h-auto w-full items-start justify-between gap-4 whitespace-normal rounded-2xl px-5 py-5 text-left"
              type="button"
              variant="outline"
            >
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-bold text-on-surface group-hover:text-primary transition-colors">Người mua (Buyer)</h3>
                <p class="text-xs text-text-soft mt-1">Khám phá, mua và quản lý các tác quyền, chứng chỉ âm nhạc bản quyền.</p>
              </div>
              <ArrowRight class="mt-0.5 shrink-0 text-outline group-hover:text-primary transition-colors" />
            </Button>

            <Button
              @click="selectRole('artist')"
              class="group min-h-[104px] h-auto w-full items-start justify-between gap-4 whitespace-normal rounded-2xl px-5 py-5 text-left"
              type="button"
              variant="outline"
            >
              <div class="min-w-0 flex-1">
                <h3 class="text-base font-bold text-on-surface group-hover:text-secondary transition-colors">Nghệ sĩ (Artist)</h3>
                <p class="text-xs text-text-soft mt-1">Phát hành tác phẩm mới và quản lý sản phẩm âm nhạc của bạn.</p>
              </div>
              <ArrowRight class="mt-0.5 shrink-0 text-outline group-hover:text-secondary transition-colors" />
            </Button>
          </div>

          <p class="text-left text-sm text-text-soft mt-8">
            Đã có tài khoản?
            <router-link :to="{ name: 'login' }" class="text-primary font-bold hover:underline">Đăng nhập</router-link>
          </p>
        </div>
      </div>
    </div>

    <footer v-once class="w-full py-4 px-6 md:px-12 border-t border-border-light bg-surface-container-lowest text-xs text-text-mute">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <nav class="flex flex-wrap justify-center sm:justify-start gap-4">
          <a class="hover:underline hover:text-primary transition-colors" href="#">Điều khoản sử dụng</a>
          <a class="hover:underline hover:text-primary transition-colors" href="#">Chính sách bảo mật</a>
          <a class="hover:underline hover:text-primary transition-colors" href="#">Thỏa thuận người dùng</a>
          <a class="hover:underline hover:text-primary transition-colors" href="#">Hỗ trợ</a>
        </nav>
        <div>
          © 2026 MusicA Inc. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>
