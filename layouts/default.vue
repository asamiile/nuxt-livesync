<template>
  <div class="flex flex-col min-h-screen">
    <TheHeader />
    <main class="flex-grow container mx-auto px-4 py-8">
      <slot />
    </main>
    <footer class="py-4 bg-gray-100">
      <div class="container mx-auto px-4 text-center text-gray-500">
        &copy; {{ currentYear }} Your Company Name.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentYear = ref(new Date().getFullYear())
</script>
