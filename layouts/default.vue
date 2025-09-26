<template>
  <div class="flex flex-col min-h-screen bg-[#3C3C3C]">
    <TheHeader />
    <main class="flex-grow container max-w-5xl mx-auto px-5 py-10 sm:py-20">
      <slot />
    </main>
    <footer class="py-4 bg-[#3C3C3C]">
      <div class="container mx-auto px-4 text-center text-secondary">
        &copy; {{ currentYear }} Your Company Name.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentYear = ref(new Date().getFullYear())
</script>
