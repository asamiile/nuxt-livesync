<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const { logout, authToken } = useAuth()

// /admin/loginページではヘッダー自体を非表示にするか、
// またはナビゲーションやログアウトボタンを非表示にする。
// ここでは、認証状態とページパスに基づいてUIを調整する。
const showAdminControls = computed(() => {
  // トークンがあり、かつ現在のパスが /admin/login ではない場合にtrue
  return authToken.value && route.path.startsWith('/admin') && route.path !== '/admin/login'
})

const handleLogout = async () => {
  await logout()
}
</script>

<template>
  <header class="border-b">
    <div class="container mx-auto px-4">
      <div class="flex h-16 items-center justify-between">
        <h1 class="text-2xl font-bold">
          <NuxtLink to="/">LiveSync Director</NuxtLink>
        </h1>
        <nav v-if="showAdminControls">
          <ul class="flex items-center space-x-6">
            <li>
              <NuxtLink
                to="/admin/cues"
                class="text-sm font-medium transition-colors hover:text-primary"
                :class="route.path === '/admin/cues' ? 'text-primary' : 'text-muted-foreground'"
              >
                演出管理
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/admin/onair"
                class="text-sm font-medium transition-colors hover:text-primary"
                :class="route.path === '/admin/onair' ? 'text-primary' : 'text-muted-foreground'"
              >
                本番操作
              </NuxtLink>
            </li>
            <li>
              <Button variant="outline" size="sm" @click="handleLogout">
                ログアウト
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>
</template>
