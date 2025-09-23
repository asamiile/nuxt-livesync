<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast/use-toast'

// 認証ロジックを読み込む
const { login } = useAuth()
const { toast } = useToast()

const password = ref('')
const isLoading = ref(false)

// ログイン処理
const handleLogin = async () => {
  if (!password.value) {
    toast({
      title: 'エラー',
      description: 'パスワードを入力してください。',
      variant: 'destructive',
    })
    return
  }

  isLoading.value = true
  try {
    // useAuthのlogin関数を呼び出す
    await login(password.value)
    // ログイン成功後、目的のページにリダイレクト
    await navigateTo('/admin/cues')
  } catch (error) {
    console.error(error)
    toast({
      title: 'ログイン失敗',
      description: 'パスワードが正しくありません。',
      variant: 'destructive',
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          管理者ログイン
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <Label for="password" class="sr-only">パスワード</Label>
            <Input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm"
              placeholder="パスワード"
            />
          </div>
        </div>

        <div>
          <Button
            type="submit"
            class="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            {{ isLoading ? 'ログイン中...' : 'ログイン' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
