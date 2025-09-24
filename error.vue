<template>
  <NuxtLayout name="default">
    <div class="flex items-center justify-center text-center">
      <div class="w-full max-w-md space-y-8 rounded-lg bg-card text-card-foreground p-8 shadow-md">
        <h1 class="mt-6 text-center text-3xl font-extrabold">{{ error.statusCode }}</h1>
        <div>
          <p class="text-xl mb-8">{{ message }}</p>
          <NuxtLink to="/">
            <Button>
              Go back home
            </Button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NuxtError } from '#app'
import { Button } from '@/components/ui/button'

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