<script setup lang="ts">
import { Film } from 'lucide-vue-next'
import type { Cue } from '~/types/cue'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()

// --- State ---
const { data: cues, error } = await useFetch<Cue[]>('/api/cues', {
  default: () => [],
  // ページにアクセスするたびに新しいキーを生成し、常に最新のデータを取得する
  key: `onair-cues-${new Date().getTime()}`,
})
if (error.value) {
  toast({
    title: 'エラー',
    description: '演出リストの取得に失敗しました。',
    variant: 'destructive',
  })
}

// --- Handlers ---
const triggerCue = async (cue: Cue) => {
  try {
    await $fetch(`/api/cues/trigger/${cue.id}`, {
      method: 'POST',
    })
    toast({
      title: '成功',
      description: `演出 '${cue.name}' をトリガーしました。`,
    })
  }
  catch (err) {
    toast({
      title: 'エラー',
      description: '演出のトリガーに失敗しました。',
      variant: 'destructive',
    })
  }
}
</script>

<template>
  <div class="container mx-auto p-8">
    <header class="mb-8 flex items-center justify-between">
      <h1 class="text-3xl font-bold">ライブ本番操作</h1>
      <div class="text-lg font-semibold">
        現在の接続人数: N/A
      </div>
    </header>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <div v-for="cue in cues" :key="cue.id">
        <Button
          variant="outline"
          class="h-32 w-full flex-col items-center justify-center gap-2 p-4 text-center"
          @click="triggerCue(cue)"
        >
          <div class="flex h-6 w-6 items-center justify-center">
            <div
              v-if="cue.type === 'color'"
              class="h-full w-full rounded-full border"
              :style="{ backgroundColor: cue.value }"
            ></div>
            <Film v-else-if="cue.type === 'animation'" class="h-full w-full" />
          </div>
          <span class="text-sm font-medium">{{ cue.name }}</span>
        </Button>
      </div>
    </div>
  </div>
</template>
