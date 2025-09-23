<template>
  <div class="relative h-screen w-screen">
    <!-- Color Display -->
    <div
      v-if="activeCue?.type === 'color'"
      class="h-full w-full"
      :style="{ backgroundColor: activeCue.value }"
      data-testid="color-display"
    />

    <!-- Lottie Animation Display -->
    <div
      v-else-if="activeCue?.type === 'animation'"
      class="flex h-full w-full items-center justify-center"
    >
      <ClientOnly>
        <Vue3Lottie :animation-link="activeCue.value" height="80%" width="80%" />
      </ClientOnly>
    </div>

    <!-- Waiting State -->
    <div v-else class="flex h-full w-full items-center justify-center bg-gray-800 text-white">
      <h1 class="text-4xl font-bold">待機中...</h1>
    </div>

    <!-- Test Buttons (for development) -->
    <div class="fixed bottom-5 left-1/2 -translate-x-1/2 transform space-x-4 rounded-lg bg-gray-900 bg-opacity-50 p-4">
      <button @click="setRed" class="rounded-md bg-red-500 px-4 py-2 font-semibold text-white shadow-lg hover:bg-red-600">
        赤色を表示
      </button>
      <button @click="setAnimation" class="rounded-md bg-blue-500 px-4 py-2 font-semibold text-white shadow-lg hover:bg-blue-600">
        アニメーションを再生
      </button>
      <button @click="resetCue" class="rounded-md bg-gray-500 px-4 py-2 font-semibold text-white shadow-lg hover:bg-gray-600">
        リセット
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import type { Cue } from '~/types/cue'
import Vue3Lottie from 'vue3-lottie'

// Define the layout for this page
definePageMeta({
  layout: false,
})

const props = defineProps({
  currentCue: {
    type: Object as PropType<Cue | null>,
    default: null,
  },
})

// Internal state for demonstration purposes
const internalCue = ref<Cue | null>(null)

// The computed property that decides which cue to display.
// It prioritizes the prop (for testing) over the internal state (for demo).
const activeCue = computed(() => props.currentCue !== null ? props.currentCue : internalCue.value)

// --- Test button logic ---
const setRed = () => {
  internalCue.value = {
    id: 'c1',
    name: 'Red',
    type: 'color',
    value: '#ef4444', // Tailwind's red-500
  }
}

const setAnimation = () => {
  internalCue.value = {
    id: 'c2',
    name: 'Animation',
    type: 'animation',
    value: 'https://lottie.host/embed/eb085e90-8ade-428b-95b8-726a92b7be9d/0ScCF7lWrQ.json',
  }
}

const resetCue = () => {
  internalCue.value = null
}
</script>

<style>
/* Ensure the page takes the full viewport without scrollbars */
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
