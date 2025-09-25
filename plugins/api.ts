import { ofetch } from 'ofetch'

/**
 * API通信専用のラッパー `$apiFetch` を提供するNuxtプラグイン
 *
 * このラッパーは、環境に応じたURLの書き換えやCookieの転送を自動的に行います。
 * これにより、Nuxtのバージョン互換性の問題を回避し、より安定した実装を実現します。
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const apiFetch = ofetch.create({
    // `onRequest` フックを使用して、リクエストが送信される直前に処理を挟む
    onRequest({ request, options }) {
      // リクエストURLを格納する変数
      let baseUrl = ''

      // サーバーサイドでのみ、環境に応じたベースURLを設定
      if (process.server) {
        if (config.public.apiBaseUrl) {
          // Vercel環境: 環境変数からベースURLを取得
          baseUrl = config.public.apiBaseUrl
        } else {
          // ローカル環境: 直接バックエンドのURLを指定
          baseUrl = 'http://127.0.0.1:8000'
        }
      }
      // クライアントサイドでは、ベースURLは不要（プロキシ経由で解決される）

      // ベースURLが設定されていれば、リクエストURLの先頭に付加
      if (baseUrl) {
        options.baseURL = baseUrl
      }

      // サーバーサイドでのリクエスト時にCookieを転送
      if (process.server) {
        const headers = useRequestHeaders(['cookie'])
        if (headers.cookie) {
          options.headers = options.headers || {}
          options.headers['cookie'] = headers.cookie
        }
      }
    },

    // `onResponseError` フックで、エラー発生時の共通処理を記述できる
    // (今回は特に処理なし)
    onResponseError({ response }) {
      // console.error('API request error:', response.status, response._data)
    },
  })

  // `$apiFetch` をNuxtアプリケーション全体で利用できるように提供する
  nuxtApp.provide('apiFetch', apiFetch)
})