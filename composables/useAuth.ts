import { useState } from '#app'

export const useAuth = () => {
  const authToken = useCookie<string | null>('auth_token', {
    // secure: process.env.NODE_ENV === 'production', // 本番環境でのみtrue
    httpOnly: false, // クライアント側で読み書きするためfalse
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
  })

  const isAuthenticated = useState('isAuthenticated', () => false)

  // ログイン処理
  const login = async (password: string) => {
    try {
      const data = await useApiFetch<{ token: string }>('/login', {
        method: 'POST',
        body: { password },
      })

      if (data?.token) {
        authToken.value = data.token
        isAuthenticated.value = true
      } else {
        throw new Error('Login did not return a token.')
      }
    } catch (error) {
      console.error('Login failed:', error)
      isAuthenticated.value = false
      authToken.value = null
      throw new Error('Login failed')
    }
  }

  // ログアウト処理
  const logout = async () => {
    if (!authToken.value) return

    try {
      // useApiFetchが自動でヘッダーを付与する
      await useApiFetch('/logout', {
        method: 'POST',
      })
    } catch (error) {
        // サーバー側でエラーが発生しても、クライアント側ではログアウト処理を続行する
        // 例えば、サーバーがダウンしていてもユーザーはログアウトできるべき
        console.warn('Logout API call failed, but proceeding with client-side logout.', error)
    } finally {
        // 常にCookieを削除し、状態を更新する
        authToken.value = null
        isAuthenticated.value = false
        // ログインページにリダイレクト
        await navigateTo('/admin/login')
    }
  }

  // トークン検証処理
  const verifyToken = async () => {
    if (!authToken.value) {
      isAuthenticated.value = false
      return false
    }

    try {
      // useApiFetchが自動でヘッダーを付与する
      const { authenticated } = await useApiFetch<{ authenticated: boolean }>('/verify')

      isAuthenticated.value = authenticated
      // レスポンスが false の場合、トークンは無効なのでクリアする
      if (!authenticated) {
        authToken.value = null
      }
      return authenticated
    } catch (error) {
      console.error('Token verification failed:', error)
      isAuthenticated.value = false
      // エラー時もトークンをクリアする
      authToken.value = null
      return false
    }
  }

  return {
    authToken,
    isAuthenticated,
    login,
    logout,
    verifyToken,
  }
}
