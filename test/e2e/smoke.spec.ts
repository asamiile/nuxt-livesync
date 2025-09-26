import { describe, test, expect } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils/e2e'
import dotenv from 'dotenv'

// .envから環境変数を読み込む
dotenv.config()

await setup({
  server: true,
})

describe('E2E Smoke Test', () => {
  test('トップページが正しく表示されること', async () => {
    // ページを作成して'/'にアクセス
    const page = await createPage('/')

    // h1要素に'Waiting...'というテキストが含まれていることを確認
    const heading = page.locator('h1')
    await expect(heading).toContainText('Waiting...')
  })
})