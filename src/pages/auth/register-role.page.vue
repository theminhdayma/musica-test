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
  <div class="min-h-screen bg-surface flex flex-col md:flex-row w-full h-full text-on-surface">
    <!-- Left Side: Hero Image -->
    <div class="hidden md:block w-1/2 h-screen relative bg-surface-container">
      <img
        alt="Music Studio Hero"
        class="w-full h-full object-cover"
        src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent flex items-end p-12">
        <div class="text-white max-w-lg">
          <h2 class="font-headline-lg text-4xl font-extrabold mb-4">Âm nhạc kết nối tâm hồn.</h2>
          <p class="font-body-md opacity-90">
            Tham gia cộng đồng những người sáng tạo và đam mê âm nhạc. Khám phá, giao dịch và bảo vệ bản quyền tác phẩm của bạn.
          </p>
        </div>
      </div>
    </div>

    <!-- Right Side: Content -->
    <div class="w-full md:w-1/2 min-h-screen flex flex-col justify-center bg-surface-container-lowest p-8 md:p-12 lg:p-16 xl:p-24">
      <div class="w-full max-w-md mx-auto">
        <!-- Logo Header -->
        <div class="mb-12">
          <h1 class="text-3xl font-extrabold text-primary tracking-tight">MusicA</h1>
        </div>

        <div class="text-left mb-8">
          <span class="inline-block px-3 py-1 bg-surface-container rounded-full text-primary text-xs font-bold uppercase mb-3">
            ĐĂNG KÝ
          </span>
          <h2 class="text-2xl font-bold mb-2">Chọn vai trò của bạn</h2>
          <p class="text-text-mute">Bạn muốn tham gia MusicA với tư cách nào?</p>
        </div>

        <!-- Role Select Options -->
        <div class="space-y-4">
          <button
            @click="selectRole('buyer')"
            class="w-full p-6 text-left border border-border-light rounded-2xl hover:border-primary hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div>
              <h3 class="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">Người mua (Buyer)</h3>
              <p class="text-sm text-text-soft mt-1">Khám phá, mua và quản lý các tác quyền, chứng chỉ âm nhạc bản quyền.</p>
            </div>
            <span class="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_forward</span>
          </button>

          <button
            @click="selectRole('artist')"
            class="w-full p-6 text-left border border-border-light rounded-2xl hover:border-secondary hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div>
              <h3 class="text-lg font-bold text-on-surface group-hover:text-secondary transition-colors">Nghệ sĩ (Artist)</h3>
              <p class="text-sm text-text-soft mt-1">Phát hành tác phẩm mới, tạo NFT và quản lý sản phẩm âm nhạc của bạn.</p>
            </div>
            <span class="material-symbols-outlined text-outline group-hover:text-secondary transition-colors">arrow_forward</span>
          </button>
        </div>

        <p class="text-left text-text-soft text-sm mt-8">
          Đã có tài khoản?
          <router-link :to="{ name: 'login' }" class="text-primary font-bold hover:underline">Đăng nhập</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
