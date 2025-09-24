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
    const { data, error } = await useFetch<{ token: string }>('/api/login', {
      method: 'POST',
      body: { password },
    })

    if (error.value) {
      console.error('Login failed:', error.value)
      throw new Error('Login failed')
    }

    if (data.value?.token) {
      authToken.value = data.value.token
      isAuthenticated.value = true
    }
  }

  // ログアウト処理
  const logout = async () => {
    if (!authToken.value) return

    try {
      await $fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
        },
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
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${authToken.value}`,
      }

      // サーバーサイドでのみ、リクエストからCookieヘッダーを取得して転送する
      if (process.server) {
        const requestHeaders = useRequestHeaders(['cookie'])
        if (requestHeaders.cookie) {
          headers.cookie = requestHeaders.cookie
        }
      }

      const { authenticated } = await $fetch<{ authenticated: boolean }>('/api/verify', {
        headers,
      })

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
