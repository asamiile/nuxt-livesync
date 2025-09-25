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
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Cue } from '~/types/cue'

// Define the layout for this page
definePageMeta({
  layout: false, // No layout for this page
})

const supabase = useSupabaseClient()
const cues = ref<Cue[]>([])
const currentCue = ref<Cue | null>(null)
let channel: RealtimeChannel | null = null

// --- Handlers ---
const handleLiveStateUpdate = (payload: any) => {
  const newCueId = payload.new.active_cue_id
  if (newCueId) {
    const receivedCue = cues.value.find(c => c.id === newCueId)
    if (receivedCue) {
      currentCue.value = receivedCue
    }
    else {
      console.warn(`Cue with id "${newCueId}" not found.`)
    }
  }
  else {
    // active_cue_idがnullに設定された場合、待機状態に戻す
    currentCue.value = null
  }
}

// --- Lifecycle Hooks ---
onMounted(async () => {
  // 最初にすべての演出データを取得
  try {
    const { data: fetchedCues, error } = await supabase.from('cues').select('*')
    if (error) throw error
    cues.value = fetchedCues
  }
  catch (error) {
    console.error('Failed to fetch cues:', error)
    return
  }

  // Supabase Realtimeでlive_stateテーブルの変更を購読
  channel = supabase
    .channel('live-state-channel')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'live_state',
        filter: 'id=eq.1', // id=1のレコードの変更のみを監視
      },
      handleLiveStateUpdate,
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('Supabase Realtime connection established')
      }
      if (status === 'CHANNEL_ERROR') {
        console.error(`Realtime channel error:`, err)
      }
      if (status === 'TIMED_OUT') {
        console.warn('Realtime connection timed out.')
      }
    })
})

onUnmounted(() => {
  if (channel) {
    supabase.removeChannel(channel)
    channel = null
    console.log('Supabase Realtime channel removed')
  }
})
</script>

<style>
</style>
