export default defineNuxtPlugin(async (nuxtApp) => {
  const { authToken, verifyToken } = useAuth()

  // サーバーサイドまたはクライアントサイドでトークンが存在する場合のみ検証を実行する
  if (authToken.value) {
    // useAuth内の`useState`で管理されている`isAuthenticated`の状態を更新する
    await verifyToken()
  }
})
