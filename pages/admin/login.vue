<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast/use-toast'

// 認証ロジックを読み込む
const { login } = useAuth()
const { toast } = useToast()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

// ログイン処理
const handleLogin = async () => {
  if (!email.value || !password.value) {
    toast({
      title: 'エラー',
      description: 'メールアドレスとパスワードを入力してください。',
      variant: 'destructive',
    })
    return
  }

  isLoading.value = true
  try {
    // useAuthのlogin関数を呼び出す
    await login(email.value, password.value)
    // ログイン成功後、目的のページにリダイレクト
    await navigateTo('/admin/cues')
  } catch (error: any) {
    console.error(error)
    toast({
      title: 'ログイン失敗',
      description: error.message || '不明なエラーが発生しました。',
      variant: 'destructive',
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center">
    <div class="w-full max-w-md space-y-8 rounded-lg bg-card text-card-foreground p-8 shadow-md">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold">
          管理者ログイン
        </h2>
      </div>
      <form class="mt-8 space-y-6" method="post" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <Label for="email-address">メールアドレス</Label>
            <Input
              id="email-address"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="メールアドレス"
            />
          </div>
          <div>
            <Label for="password">パスワード</Label>
            <Input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="パスワード"
            />
          </div>
        </div>

        <div>
          <Button
            type="submit"
            class="w-full"
            :disabled="isLoading"
            variant="default"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            {{ isLoading ? 'ログイン中...' : 'ログイン' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
