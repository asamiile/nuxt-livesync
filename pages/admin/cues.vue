<script setup lang="ts">
import { ref, type PropType } from 'vue'
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

// --- Props ---
defineProps({
  cues: {
    type: Array as PropType<Cue[]>,
    default: () => [
      { id: '1', name: 'オープニング（赤）', type: 'color', value: '#ff0000' },
      { id: '2', name: 'ロゴアニメーション', type: 'animation', value: 'https://lottie.host/embed/8f4252de-e9e2-4d56-baa4-3adc138510c4/EiPNTtYLyF.lottie' },
    ],
  },
})

// --- State ---
const newCue = ref<Omit<Cue, 'id'>>({
  name: '',
  type: 'color',
  value: '#000000',
})

const isDialogOpen = ref(false)

// --- Handlers ---
// In a real app, this would emit an event to the parent
const handleSubmit = () => {
  console.log('New cue submitted:', newCue.value)
  isDialogOpen.value = false
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
              <Input id="value" v-model="newCue.value" class="col-span-3" />
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
          <TableRow v-if="cues.length === 0">
             <TableCell colspan="4" class="text-center">演出がありません。</TableCell>
          </TableRow>
          <template v-else>
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
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
