<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Cue } from '~/types/cue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

// --- State ---
// APIからデータを取得
const { data: cues, refresh } = await useFetch<Cue[]>('/api/cues', {
  default: () => []
})


const newCue = ref<Omit<Cue, 'id'>>({
  name: '',
  type: 'color',
  value: '#000000',
})

const isDialogOpen = ref(false)

defineExpose({
  cues,
  isDialogOpen,
})

watch(() => newCue.value.type, (newType) => {
  if (newType === 'animation') {
    newCue.value.value = ''
  } else if (newType === 'color') {
    newCue.value.value = '#000000'
  }
})


// --- Handlers ---
const handleSubmit = async () => {
  if (!newCue.value.name || !newCue.value.value) {
    // Basic validation
    alert('演出名と値を入力してください。')
    return
  }

  try {
    await $fetch('/api/cues', {
      method: 'POST',
      body: newCue.value,
    });

    // Reset form and close dialog
    newCue.value = {
      name: '',
      type: 'color',
      value: '#000000',
    }
    isDialogOpen.value = false

    // Refresh the cue list
    await refresh();

  } catch (error) {
    console.error('Failed to create cue:', error);
    alert('演出の作成に失敗しました。');
  }
}
</script>

<template>
  <div class="container mx-auto p-8">
    <header class="mb-8 flex items-center justify-between">
      <h1 class="text-3xl font-bold">演出管理</h1>
      <Dialog v-model:open="isDialogOpen">
        <DialogTrigger as-child>
          <Button>新規演出を追加</Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>新規演出を追加</DialogTitle>
            <DialogDescription>
              新しい演出の詳細を入力してください。
            </DialogDescription>
          </DialogHeader>
          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="name" class="text-right">
                演出名
              </Label>
              <Input id="name" v-model="newCue.name" class="col-span-3" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
              <Label class="text-right">
                種類
              </Label>
              <RadioGroup v-model="newCue.type" class="col-span-3 flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem id="r1" value="color" />
                  <Label for="r1">単色</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem id="r2" value="animation" />
                  <Label for="r2">アニメーション</Label>
                </div>
              </RadioGroup>
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="value" class="text-right">
                値
              </Label>
              <Input
                id="value"
                v-model="newCue.value"
                class="col-span-3"
                :placeholder="newCue.type === 'animation' ? 'lottieのURL' : ''"
              />
            </div>
            <div v-if="newCue.type === 'animation'" class="grid grid-cols-4 items-center gap-4 -mt-3">
              <div class="col-start-2 col-span-3 text-sm">
                <a href="https://lottiefiles.com/jp/blog/working-with-lottie/how-to-create-lottie-animations-from-scratch" target="_blank" class="text-blue-500 hover:underline">
                  LottieアニメーションのJSONの作り方
                </a>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" @click="handleSubmit">
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[200px]">演出名</TableHead>
            <TableHead class="w-[120px]">種類</TableHead>
            <TableHead>値 / プレビュー</TableHead>
            <TableHead class="w-[180px] text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="cue in cues" :key="cue.id">
            <TableCell class="font-medium">{{ cue.name }}</TableCell>
            <TableCell>{{ cue.type === 'color' ? '単色' : 'アニメーション' }}</TableCell>
            <TableCell>
              <template v-if="cue.type === 'color'">
                <div class="flex items-center gap-2">
                  <div class="h-6 w-6 rounded-full border" :style="{ backgroundColor: cue.value }"></div>
                  <span>{{ cue.value }}</span>
                </div>
              </template>
              <template v-else-if="cue.type === 'animation'">
                <a :href="cue.value" target="_blank" class="text-blue-500 hover:underline">
                  {{ cue.value }}
                </a>
              </template>
            </TableCell>
            <TableCell class="text-right">
              <Button variant="outline" size="sm" class="mr-2">編集</Button>
              <Button variant="destructive" size="sm">削除</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
