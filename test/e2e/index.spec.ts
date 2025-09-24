import { test, expect } from '@nuxt/test-utils/playwright'

test('Homepage', async ({ page, goto }) => {
  await goto('/', {
    waitUntil: 'hydration',
    nuxt: {
      runtimeConfig: {
        public: {
          apiBase: 'http://127.0.0.1:8000/api'
        }
      }
    }
  })

  // The page should display "待機中..." initially.
  await expect(page.getByRole('heading', { name: '待機中...' })).toBeVisible()
})
