import { test, expect } from '@nuxt/test-utils/playwright'

test('smoke test', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.getByText('Waiting...')).toBeVisible()
})