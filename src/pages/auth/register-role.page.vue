<script setup lang="ts">
import { useRouter } from 'vue-router'

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
  <div class="min-h-screen bg-background text-on-surface font-body-md text-sm flex flex-col w-full">
    <!-- Upper Content Area: Split layout -->
    <div class="flex-grow flex flex-col md:flex-row w-full">
      <!-- Left Side: Hero Image -->
      <div class="w-full md:w-1/2 relative min-h-[300px] md:min-h-0 bg-surface-container">
        <img
          alt="Music Studio Hero"
          class="absolute inset-0 w-full h-full object-cover"
          src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg"
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

      <!-- Right Side: Content (Slightly larger fonts) -->
      <div class="w-full md:w-1/2 flex items-center justify-center bg-surface-container-lowest p-8 md:p-12">
        <div class="w-full max-w-sm">
          <!-- Logo Header -->
          <div class="mb-5">
            <h1 class="text-3xl font-extrabold text-primary tracking-tight">MusicA</h1>
          </div>

          <div class="text-left mb-6">
            <span class="inline-block px-3 py-1 bg-surface-container rounded-full text-primary text-xs font-bold uppercase mb-2">
              ĐĂNG KÝ
            </span>
            <h2 class="text-2xl font-bold mb-1">Chọn vai trò của bạn</h2>
            <p class="text-sm text-text-mute">Bạn muốn tham gia MusicA với tư cách nào?</p>
          </div>

          <!-- Role Select Options -->
          <div class="space-y-4">
            <button
              @click="selectRole('buyer')"
              class="w-full p-5 text-left border border-border-light rounded-2xl hover:border-primary hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div>
                <h3 class="text-base font-bold text-on-surface group-hover:text-primary transition-colors">Người mua (Buyer)</h3>
                <p class="text-xs text-text-soft mt-1">Khám phá, mua và quản lý các tác quyền, chứng chỉ âm nhạc bản quyền.</p>
              </div>
              <span class="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[18px]">arrow_forward</span>
            </button>

            <button
              @click="selectRole('artist')"
              class="w-full p-5 text-left border border-border-light rounded-2xl hover:border-secondary hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div>
                <h3 class="text-base font-bold text-on-surface group-hover:text-secondary transition-colors">Nghệ sĩ (Artist)</h3>
                <p class="text-xs text-text-soft mt-1">Phát hành tác phẩm mới và quản lý sản phẩm âm nhạc của bạn.</p>
              </div>
              <span class="material-symbols-outlined text-outline group-hover:text-secondary transition-colors text-[18px]">arrow_forward</span>
            </button>
          </div>

          <p class="text-left text-sm text-text-soft mt-8">
            Đã có tài khoản?
            <router-link :to="{ name: 'login' }" class="text-primary font-bold hover:underline">Đăng nhập</router-link>
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Row: Full-width Footer -->
    <footer class="w-full py-4 px-6 md:px-12 border-t border-border-light bg-surface-container-lowest text-xs text-text-mute shrink-0">
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
