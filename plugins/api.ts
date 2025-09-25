import type { NitroFetchOptions } from 'nitropack'

/**
 * Vercel環境のSSR時にAPIリクエストを書き換えるNuxtプラグイン
 */
export default defineNuxtPlugin(() => {
  const defaults: NitroFetchOptions<any, any> = {
    // Vercel環境のサーバーサイドでのみリクエストを書き換える
    onRequest({ request, options }) {
      if (process.server && process.env.NUXT_PUBLIC_API_BASE_URL) {
        // APIリクエストの場合のみ処理 (e.g. /api/...)
        if (request.toString().startsWith('/api/')) {
          // 環境変数からベースURLを取得
          const apiBaseUrl = process.env.NUXT_PUBLIC_API_BASE_URL
          // URLを絶対パスに書き換え
          options.baseURL = apiBaseUrl

          // Cookieをヘッダーに添付
          const headers = useRequestHeaders(['cookie'])
          options.headers = options.headers || {}
          if (headers.cookie) {
            options.headers['cookie'] = headers.cookie
          }
        }
      }
    },
  }

  // Nuxt 3.11.0以降で推奨されるグローバルな$fetchオプションの設定方法
  const { $fetch } = useNuxtApp()
  // @ts-ignore - TODO: 型を正しく適用する
  $fetch.defaults(defaults)
})