<template>
  <div class="relative h-screen w-screen">
    <!-- Color Display -->
    <div
      v-if="currentCue?.type === 'color'"
      class="h-full w-full"
      :style="{ backgroundColor: currentCue.value }"
    />

    <!-- Lottie Animation Display -->
    <div
      v-else-if="currentCue?.type === 'animation'"
      class="flex h-full w-full items-center justify-center"
    >
      <LottiePlayer v-if="currentCue.value" :src="currentCue.value" />
    </div>

    <!-- Waiting State -->
    <div v-else class="flex h-full w-full items-center justify-center bg-gray-800 text-white">
      <h1 class="text-4xl font-bold">待機中...</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Cue } from '~/types/cue'

// Define the layout for this page
definePageMeta({
  layout: false, // No layout for this page
})

const cues = ref<Cue[]>([])
const currentCue = ref<Cue | null>(null)
let socket: WebSocket | null = null

onMounted(async () => {
  // Fetch all cues
  try {
    const fetchedCues = await $fetch<Cue[]>('/api/cues', {
      // baseURLはNuxtのプロキシ設定に任せる
    })
    cues.value = fetchedCues
  }
  catch (error) {
    console.error('Failed to fetch cues:', error)
    // エラーハンドリング: 例えば、ユーザーに通知を表示するなど
    return
  }

  // Setup WebSocket
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  // Vercel環境では `window.location.host` にポートが含まれないが、
  // ローカル開発環境では `localhost:3000` のようになる。
  // FastAPIサーバーは8000番で動いているため、ホスト名を置換する必要がある。
  const host = process.dev ? 'localhost:8000' : window.location.host
  const wsUrl = `${wsProtocol}//${host}/ws/live`

  socket = new WebSocket(wsUrl)

  socket.onopen = () => {
    console.log('WebSocket connection established')
  }

  socket.onmessage = (event) => {
    const cueId = event.data
    const receivedCue = cues.value.find(c => c.id === cueId)
    if (receivedCue) {
      currentCue.value = receivedCue
    }
    else {
      console.warn(`Cue with id "${cueId}" not found.`)
    }
  }

  socket.onclose = () => {
    console.log('WebSocket connection closed')
  }

  socket.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
})

onUnmounted(() => {
  if (socket) {
    socket.close()
  }
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
