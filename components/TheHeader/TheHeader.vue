<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '~/composables/useAuth'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

const route = useRoute()
const { logout, isAuthenticated } = useAuth()

// /admin/loginページではヘッダー自体を非表示にするか、
// またはナビゲーションやログアウトボタンを非表示にする。
// ここでは、認証状態とページパスに基づいてUIを調整する。
const showAdminControls = computed(() => {
  // 認証済みで、かつ現在のパスが /admin/login ではない場合にtrue
  return isAuthenticated.value && route.path.startsWith('/admin') && route.path !== '/admin/login'
})

const handleLogout = async () => {
  await logout()
}

// Expose for testing
defineExpose({
  isAuthenticated,
  handleLogout,
})
</script>

<template>
  <header class="border-b bg-white text-foreground">
    <div class="container mx-auto p-4 sm:py-0">
      <div class="flex flex-col sm:flex-row sm:h-16 sm:items-center sm:justify-between gap-3">
        <h1 class="text-2xl font-bold">
          <NuxtLink to="/">LiveSync Director</NuxtLink>
        </h1>
        <nav v-if="showAdminControls">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NuxtLink to="/admin/cues" legacy-behavior pass-through>
                  <NavigationMenuLink :active="route.path === '/admin/cues'" :class="navigationMenuTriggerStyle()">
                    演出管理
                  </NavigationMenuLink>
                </NuxtLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NuxtLink to="/admin/onair" legacy-behavior pass-through>
                  <NavigationMenuLink :active="route.path === '/admin/onair'" :class="navigationMenuTriggerStyle()">
                    本番操作
                  </NavigationMenuLink>
                </NuxtLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Button variant="outline" size="sm" @click="handleLogout">
                  ログアウト
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
      </div>
    </div>
  </header>
</template>
