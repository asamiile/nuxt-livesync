<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Cue } from '~/types/cue'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
import { Skeleton } from '@/components/ui/skeleton'
import LottiePlayer from '~/components/LottiePlayer/LottiePlayer.vue'

// Supabaseクライアントを取得
const supabase = useSupabaseClient()

// --- State ---

const cues = ref<Cue[] | null>([])
const pending = ref(true)

const isDialogOpen = ref(false)
const editingCue = ref<Cue | null>(null)

// 新規/編集フォーム用のデータモデル
const cueFormData = ref<Omit<Cue, 'id'>>({
  name: '',
  type: 'color',
  value: '',
})

// ダイアログのタイトルを動的に変更
const dialogTitle = computed(() => editingCue.value ? '演出を編集' : '新規演出を追加')
const dialogDescription = computed(() => editingCue.value ? '演出の内容を更新します。' : '新しい演出の詳細を入力してください。')

// --- Data Fetching ---

// データを取得する関数
const fetchCues = async () => {
  pending.value = true
  try {
    const { data, error } = await supabase
      .from('cues')
      .select('*')
      .order('id', { ascending: true }) // IDでソート

    if (error) throw error
    cues.value = data
  } catch (error) {
    console.error('Failed to fetch cues:', error)
    alert('演出の取得に失敗しました。')
  } finally {
    pending.value = false
  }
}

// コンポーネントがマウントされた時にデータを取得
onMounted(() => {
  fetchCues()
})


// --- Watchers ---

// 演出タイプの変更を監視し、値の初期値を設定
watch(() => cueFormData.value.type, (newType) => {
  // 新規追加時のみ、タイプの変更に応じて値を初期化する
  if (editingCue.value === null) {
    if (newType === 'animation') {
      cueFormData.value.value = ''
    } else if (newType === 'color') {
      cueFormData.value.value = ''
    }
  }
})


// --- Expose for testing ---
defineExpose({
  isDialogOpen,
})

// --- Handlers ---

// 新規追加ダイアログを開く
const handleAddNewClick = () => {
  editingCue.value = null
  cueFormData.value = {
    name: '',
    type: 'color',
    value: '',
  }
  isDialogOpen.value = true
}

// 編集ダイアログを開く
const handleEditClick = (cue: Cue) => {
  editingCue.value = cue
  // オブジェクトをコピーして、フォームの変更が即座にテーブルに反映されないようにする
  cueFormData.value = {
    name: cue.name,
    type: cue.type,
    value: cue.value,
  }
  isDialogOpen.value = true
}

// 保存ボタンの処理 (新規/編集)
const handleSubmit = async () => {
  if (!cueFormData.value.name || !cueFormData.value.value) {
    alert('演出名と値を入力してください。')
    return
  }

  try {
    if (editingCue.value) {
      // 編集モード
      const { error } = await supabase
        .from('cues')
        .update(cueFormData.value)
        .eq('id', editingCue.value.id)
      if (error) throw error
    } else {
      // 新規追加モード
      const { error } = await supabase
        .from('cues')
        .insert([cueFormData.value])
      if (error) throw error
    }

    isDialogOpen.value = false
    await fetchCues() // テーブルを更新

  } catch (error) {
    console.error('Failed to save cue:', error)
    alert('演出の保存に失敗しました。')
  }
}

// 削除処理
const handleDelete = async (cueId: string) => {
  try {
    const { error } = await supabase
      .from('cues')
      .delete()
      .eq('id', cueId)
    if (error) throw error
    await fetchCues() // テーブルを更新
  } catch (error) {
    console.error('Failed to delete cue:', error)
    alert('演出の削除に失敗しました。')
  }
}

</script>

<template>
  <div>
    <header class="mb-8 flex items-center justify-between text-secondary">
      <h1 class="text-3xl font-bold">演出管理</h1>
      <Dialog v-model:open="isDialogOpen">
        <Button @click="handleAddNewClick">新規演出を追加</Button>
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{{ dialogTitle }}</DialogTitle>
            <DialogDescription>
              {{ dialogDescription }}
            </DialogDescription>
          </DialogHeader>
          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <Label for="name" class="text-right">
                演出名
              </Label>
              <Input id="name" v-model="cueFormData.name" placeholder="演出の名前を入力" class="col-span-3" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
              <Label class="text-right">
                種類
              </Label>
              <RadioGroup v-model="cueFormData.type" class="col-span-3 flex items-center space-x-4">
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
                v-model="cueFormData.value"
                class="col-span-3"
                :placeholder="cueFormData.type === 'animation' ? 'LottieのURLを入力' : '#000など色の値を入力'"
              />
            </div>
            <div v-if="cueFormData.type === 'animation'" class="grid grid-cols-4 items-center gap-4 -mt-3">
              <div class="col-start-2 col-span-3 text-sm">
                <a href="https://lottiefiles.com/jp/" target="_blank" class="text-blue-400 hover:underline">
                  Lottieアニメーションを作成
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

    <div class="bg-card text-card-foreground rounded-lg shadow-md border">
      <Table class="whitespace-nowrap">
        <TableHeader>
          <TableRow>
            <TableHead class="w-[200px]">演出名</TableHead>
            <TableHead class="w-[120px]">種類</TableHead>
            <TableHead>値 / プレビュー</TableHead>
            <TableHead class="w-[180px] text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody v-if="pending">
          <TableRow v-for="n in 5" :key="n">
            <TableCell>
              <Skeleton class="h-6 w-3/4" />
            </TableCell>
            <TableCell>
              <Skeleton class="h-6 w-1/2" />
            </TableCell>
            <TableCell>
              <Skeleton class="h-6 w-full" />
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <Skeleton class="h-9 w-[3.25rem]" />
                <Skeleton class="h-9 w-[3.25rem]" />
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody v-else>
          <TableRow v-if="cues && cues.length === 0">
            <TableCell colspan="4" class="text-center text-sm text-muted-foreground">
                演出が登録されていません。
              </TableCell>
          </TableRow>
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
                <div class="flex items-center gap-4">
                  <a :href="cue.value" target="_blank" class="size-10">
                    <LottiePlayer :src="cue.value" />
                  </a>
                </div>
              </template>
            </TableCell>
            <TableCell class="text-right">
              <Button variant="outline" size="sm" class="mr-2" @click="handleEditClick(cue)">編集</Button>
              <AlertDialog>
                <AlertDialogTrigger as-child>
                  <Button variant="destructive" size="sm">削除</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                      この操作は元に戻せません。「{{ cue.name }}」のデータをサーバーから完全に削除します。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction :class="buttonVariants({ variant: 'destructive' })" @click="handleDelete(cue.id)">はい、削除します</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
