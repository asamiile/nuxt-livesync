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

  await expect(page.getByRole('heading', { name: 'Cue-T' })).toBeVisible()
  await expect(page.getByText('リアルタイムに演出をコントロール')).toBeVisible()
})
