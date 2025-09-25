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
      <h1 class="text-4xl font-bold">Waiting...</h1>
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
    const fetchedCues = await useApiFetch<Cue[]>('/cues')
    cues.value = fetchedCues
  }
  catch (error) {
    console.error('Failed to fetch cues:', error)
    // エラーハンドリング: 例えば、ユーザーに通知を表示するなど
    return
  }

  // Setup WebSocket
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl

  let wsUrl: string
  // Vercel環境（本番URLが設定されている）かローカル環境かを判定
  if (apiUrl.includes('vercel.app')) {
    // Vercel環境: 公開URLからWebSocket URLを構築
    wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws/live'
  } else {
    // ローカル環境: 現在のホストからWebSocket URLを構築し、プロキシを利用
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host // e.g., localhost:3000
    wsUrl = `${wsProtocol}//${host}/ws/live`
  }

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
</style>
