<template>
  <div class="flex flex-col min-h-screen bg-gray-200">
    <TheHeader />
    <main class="flex-grow container mx-auto px-5 py-10 sm:py-20">
      <slot />
    </main>
    <footer class="py-4 bg-gray-400">
      <div class="container mx-auto px-4 text-center text-gray-100">
        &copy; {{ currentYear }} Your Company Name.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentYear = ref(new Date().getFullYear())
</script>
