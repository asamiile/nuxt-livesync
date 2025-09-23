<template>
  <div class="relative h-screen w-screen">
    <!-- Color Display -->
    <div
      v-if="currentCue?.type === 'color'"
      class="h-full w-full"
      :style="{ backgroundColor: currentCue.value }"
      data-testid="color-display"
    />

    <!-- Lottie Animation Display -->
    <div
      v-else-if="currentCue?.type === 'animation'"
      class="flex h-full w-full items-center justify-center"
    >
      <ClientOnly>
        <Vue3Lottie :animation-link="currentCue.value" height="80%" width="80%" />
      </ClientOnly>
    </div>

    <!-- Waiting State -->
    <div v-else class="flex h-full w-full items-center justify-center bg-gray-800 text-white">
      <h1 class="text-4xl font-bold">待機中...</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'
import type { Cue } from '~/types/cue'
import Vue3Lottie from 'vue3-lottie'

// Define the layout for this page
definePageMeta({
  layout: false,
})

defineProps({
  currentCue: {
    type: Object as PropType<Cue | null>,
    default: null,
  },
})
</script>

<style>
/* Ensure the page takes the full viewport without scrollbars */
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
