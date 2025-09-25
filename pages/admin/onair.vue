<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Film } from 'lucide-vue-next'
import type { Cue } from '~/types/cue'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import LottiePlayer from '~/components/LottiePlayer.vue'

const { toast } = useToast()

// --- State ---
const { data: cues, error, pending } = await useFetch<Cue[]>('/api/cues', {
  default: () => [],
  // サーバーとクライアントでキーを一致させるため、静的なキーを使用
  key: 'onair-cues',
})
const connectionCount = ref(0)
const triggeredCueId = ref<string | null>(null)
let intervalId: NodeJS.Timeout | null = null

// --- Lifecycle Hooks ---
onMounted(async () => {
  // 初回取得
  await fetchConnectionCount()
  // 3秒ごとに定期取得
  intervalId = setInterval(fetchConnectionCount, 3000)
})

onUnmounted(() => {
  // コンポーネントが破棄されるときにインターバルをクリア
  if (intervalId) {
    clearInterval(intervalId)
  }
})

if (error.value) {
  toast({
    title: 'エラー',
    description: '演出リストの取得に失敗しました。',
    variant: 'destructive',
  })
}

// --- Methods ---
async function fetchConnectionCount() {
  try {
    const data = await $fetch<{ connections: number }>('/api/connections')
    connectionCount.value = data.connections
  }
  catch (err) {
    // エラー発生時はコンソールに出力し、カウントをリセットするかどうかは要件による
    console.error('Failed to fetch connection count:', err)
    // toast({
    // title: '警告',
    // description: '接続人数の取得に失敗しました。',
    // variant: 'destructive',
    // })
  }
}

// --- Handlers ---
const triggerCue = async (cue: Cue) => {
  try {
    await $fetch(`/api/cues/trigger/${cue.id}`, {
      method: 'POST',
    })
    toast({
      title: '成功',
      description: `演出 ${cue.name} を実行しました。`,
    })

    // --- Visual Feedback ---
    triggeredCueId.value = cue.id
  }
  catch (err) {
    toast({
      title: 'エラー',
      description: '演出の実行に失敗しました。',
      variant: 'destructive',
    })
  }
}
</script>

<template>
  <div>
    <header class="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-secondary">
      <h1 class="text-3xl font-bold">ライブ本番操作</h1>
      <div class="text-lg font-semibold">
        現在の接続人数: {{ connectionCount }}
      </div>
    </header>

    <!-- Loading Skeleton -->
    <div v-if="pending" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 10" :key="n">
        <Skeleton class="h-[12.5rem] w-full" />
      </div>
    </div>

    <!-- Cues Grid -->
    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="cue in cues" :key="cue.id">
        <Button
          :variant="triggeredCueId === cue.id ? 'default' : 'outline'"
          class="h-40 md:h-48 w-full flex-col items-center justify-center gap-4 p-4 text-center transition-all duration-200"
          @click="triggerCue(cue)"
        >
          <div class="flex size-14 md:size-20 items-center justify-center">
            <div
              v-if="cue.type === 'color'"
              class="h-full w-full rounded-full border"
              :style="{ backgroundColor: cue.value }"
            ></div>
            <LottiePlayer v-else-if="cue.type === 'animation'" :src="cue.value" />
          </div>
          <span class="text-base font-medium">{{ cue.name }}</span>
        </Button>
      </div>
    </div>
  </div>
</template>
