export default defineNuxtRouteMiddleware(async (to, from) => {
  const { authToken, isAuthenticated, verifyToken } = useAuth()

  // isAuthenticated がまだ評価されておらず、かつ authToken が存在する場合のみAPI検証を実行する
  // (サーバーでの初回アクセス時やクライアントでのリロード時に一度だけ実行されることを意図)
  if (!isAuthenticated.value && authToken.value) {
    // await をつけて、トークン検証が完了するまで待機させる
    await verifyToken()
  }

  // /admin/login へのアクセスは常に許可
  if (to.path === '/admin/login') {
    return
  }

  // /admin/ で始まる他のすべてのルートへのアクセスをチェック
  if (to.path.startsWith('/admin')) {
    // 認証状態が false であれば、ログインページにリダイレクト
    if (!isAuthenticated.value) {
      return navigateTo('/admin/login', { replace: true })
    }
  }
})
