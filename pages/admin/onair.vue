<script setup lang="ts">
import { type PropType } from 'vue'
import { Film } from 'lucide-vue-next'
import type { Cue } from '~/types/cue'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()

// --- Props ---
defineProps({
  cues: {
    type: Array as PropType<Cue[]>,
    default: () => [],
  },
})

// --- Handlers ---
const handleButtonClick = (cue: Cue) => {
  console.log(`Button clicked: ${cue.name}`)
  toast({
    title: '演出を再生しました',
    description: `'${cue.name}' を再生しました。`,
  })
}
</script>

<template>
  <div class="container mx-auto p-8">
    <header class="mb-8 flex items-center justify-between">
      <h1 class="text-3xl font-bold">ライブ本番操作</h1>
      <div class="text-lg font-semibold">
        現在の接続人数: 123人
      </div>
    </header>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <div v-for="cue in cues" :key="cue.id">
        <Button
          variant="outline"
          class="h-32 w-full flex-col items-center justify-center gap-2 p-4 text-center"
          @click="handleButtonClick(cue)"
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
