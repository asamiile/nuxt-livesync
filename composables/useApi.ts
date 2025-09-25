/**
 * Vercel環境とローカル環境でAPIとWebSocketのベースURLを切り替える
 */
export const useApi = () => {
  const httpUrl = ref('')
  const wsUrl = ref('')

  if (process.server) {
    // サーバーサイドでは、環境変数からURLを決定する
    // Vercel環境ではVERCEL_URLが設定されている
    const vercelUrl = process.env.VERCEL_URL
    if (vercelUrl) {
      // VercelのFastAPIは同じドメインで提供される
      httpUrl.value = `https://${vercelUrl}`
      wsUrl.value = `wss://${vercelUrl}`
    } else {
      // ローカル開発環境
      httpUrl.value = 'http://127.0.0.1:8000'
      wsUrl.value = 'ws://127.0.0.1:8000'
    }
  } else {
    // クライアントサイドでは、現在のウィンドウのオリジンを使用する
    // これにより、ローカルでもVercelプレビューでも動的に対応できる
    httpUrl.value = window.location.origin
    wsUrl.value = `wss://${window.location.host}`
  }

  return {
    httpUrl,
    wsUrl,
  }
}