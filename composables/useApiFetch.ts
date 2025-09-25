// composables/useApiFetch.ts
import type { UseFetchOptions } from '#app'

export const useApiFetch: typeof $fetch = (request, opts) => {
  const config = useRuntimeConfig()
  const { authToken } = useAuth()

  // Vercel環境でのみAPIのベースURLを設定し、それ以外（ローカル）ではプロキシを利用
  const baseURL = process.env.VERCEL_URL ? config.public.apiUrl : '/api'

  const options: UseFetchOptions<any> = {
    baseURL,
    ...opts,
    headers: {
      ...opts?.headers,
    },
  }

  // 認証トークンが存在する場合、リクエストがどこからであってもヘッダーを付与
  if (authToken.value) {
    // A more type-safe way to add the header.
    (options.headers as Record<string, string>).Authorization = `Bearer ${authToken.value}`
  }

  return $fetch(request, options)
}