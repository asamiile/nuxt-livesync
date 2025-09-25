// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  // /admin/以下のページ（ログインページを除く）へのアクセスをチェック
  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    // ユーザーが存在しない（未認証）場合はログインページにリダイレクト
    if (!user.value) {
      return navigateTo('/admin/login')
    }
  }

  // 認証済みのユーザーがログインページにアクセスした場合、管理トップにリダイレクト
  if (user.value && to.path === '/admin/login') {
    return navigateTo('/admin/cues')
  }
})