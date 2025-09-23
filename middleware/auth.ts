export default defineNuxtRouteMiddleware(async (to, from) => {
  // ログインページ自体はミドルウェアの対象外
  if (to.path === '/admin/login') {
    return
  }

  // useAuthコンポーザブルから認証情報を取得
  const { authToken, verifyToken } = useAuth()

  // サーバーサイドでのレンダリング時、またはクライアントサイドでのナビゲーション時に
  // Cookieにトークンが存在するかどうかを確認
  if (!authToken.value) {
    // トークンがなければログインページにリダイレクト
    return navigateTo('/admin/login')
  }

  // トークンが存在する場合、サーバーで有効性を検証
  const isAuthenticated = await verifyToken()

  if (!isAuthenticated) {
    // トークンが無効だった場合、Cookieをクリア（verifyToken内で処理される場合もあるが念のため）
    const { logout } = useAuth()
    await logout() // ログアウト処理を呼び出して、クリーンな状態でリダイレクト
    // ログインページにリダイレクト
    return navigateTo('/admin/login')
  }
})
