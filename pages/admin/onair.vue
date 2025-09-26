<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Cue } from '~/types/cue'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import LottiePlayer from '~/components/LottiePlayer/LottiePlayer.vue'

const { toast } = useToast()
const supabase = useSupabaseClient()

// --- State ---
const cues = ref<Cue[] | null>([])
const pending = ref(true)
const connectionCount = ref(0)
const triggeredCueId = ref<string | null>(null)
let intervalId: NodeJS.Timeout | null = null

// --- Data Fetching ---
const fetchCues = async () => {
  pending.value = true
  try {
    const { data, error } = await supabase
      .from('cues')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      throw error
    }
    cues.value = data
  }
  catch (err: any) {
    toast({
      title: 'エラー',
      description: '演出リストの取得に失敗しました。',
      variant: 'destructive',
    })
  }
  finally {
    pending.value = false
  }
}

// --- Lifecycle Hooks ---
let channel: any = null

onMounted(async () => {
  await fetchCues()

  channel = supabase.channel('live-state-channel', {
    config: {
      presence: {
        key: 'admin-user', // 管理者ユーザーとして参加
      },
    },
  })

  // プレゼンスイベントを購読
  channel.on('presence', { event: 'sync' }, () => {
    const presenceState = channel.presenceState()
    // 'viewer'として参加しているユーザーのみをカウント
    const viewerCount = Object.values(presenceState)
      .flat()
      // @ts-ignore
      .filter(p => p.user === 'viewer').length
    connectionCount.value = viewerCount
  })

  channel.subscribe((status: string) => {
    if (status === 'SUBSCRIBED') {
      // チャンネル参加時に自身のプレゼンスを追跡
      channel.track({ user: 'admin' })
    }
  })
})

onUnmounted(() => {
  if (channel) {
    supabase.removeChannel(channel)
  }
})

// --- Handlers ---
const triggerCue = async (cue: Cue) => {
  try {
    // live_stateテーブルの単一のレコード (id=1) を更新
    const { error } = await supabase
      .from('live_state')
      .update({ active_cue_id: cue.id, updated_at: new Date().toISOString() })
      .eq('id', 1) // live_stateテーブルには常に1つのレコードしか存在しない想定

    if (error) throw error

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
