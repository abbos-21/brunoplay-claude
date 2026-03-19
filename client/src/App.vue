<script setup lang="ts">
import { onMounted } from 'vue';
import { Toaster } from 'vue-sonner';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();

onMounted(() => {
  auth.init();
});
</script>

<template>
  <!-- Loading state -->
  <div v-if="auth.isLoading" class="flex items-center justify-center min-h-screen bg-neutral-950 text-white">
    <div class="text-center space-y-4">
      <div class="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
      <p class="text-sm text-white/60">Loading…</p>
    </div>
  </div>

  <!-- Error state -->
  <div v-else-if="auth.state === 'error'" class="flex items-center justify-center min-h-screen bg-neutral-950 text-white px-6">
    <div class="text-center space-y-4 max-w-sm">
      <p class="text-lg font-medium">Something went wrong</p>
      <p class="text-sm text-white/60">{{ auth.error }}</p>
      <button
        class="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
        @click="auth.init()"
      >
        Try again
      </button>
    </div>
  </div>

  <!-- Authenticated -->
  <template v-else-if="auth.isAuthenticated">
    <RouterView />
  </template>

  <Toaster position="top-center" :duration="3000" rich-colors />
</template>
