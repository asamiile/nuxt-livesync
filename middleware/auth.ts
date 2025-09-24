export default defineNuxtRouteMiddleware((to, from) => {
  // ログインページ自体はミドルウェアの対象外
  if (to.path === '/admin/login') {
    return
  }

  // useAuthから状態を取得する
  const { isAuthenticated } = useAuth()

  // プラグインによって設定された認証状態をチェックし、
  // falseならログインページにリダイレクトする
  if (!isAuthenticated.value) {
    // replace: true を指定して、ブラウザ履歴に残らないようにする
    return navigateTo('/admin/login', { replace: true })
  }
})
