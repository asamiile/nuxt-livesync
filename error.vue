<template>
  <NuxtLayout name="default">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">{{ error.statusCode }}</h1>
      <p class="text-xl mb-8">{{ message }}</p>
      <NuxtLink to="/" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Go back home
      </NuxtLink>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})

const message = computed(() => {
  if (props.error.statusCode === 404) {
    return "Sorry, the page you're looking for doesn't exist."
  }
  return 'An unexpected error occurred.'
})
</script>