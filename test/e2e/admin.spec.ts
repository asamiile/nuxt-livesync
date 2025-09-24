import { expect, test } from '@nuxt/test-utils/playwright'

test.describe('Admin Section', () => {
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD environment variable is not set')
  }
  const nuxtConfig = {
    public: {
      apiBase: 'http://127.0.0.1:8000/api'
    }
  }

  test('should allow login and redirect to cues page', async ({ page, goto }) => {
    // Go to the login page with runtime config overrides
    await goto('/admin/login', {
      waitUntil: 'hydration',
      nuxt: {
        runtimeConfig: nuxtConfig
      }
    })
    await expect(page.getByRole('heading', { name: '管理者ログイン' })).toBeVisible()

    // Fill in the password and click login
    await page.getByPlaceholder('パスワード').fill(adminPassword)
    await page.getByRole('button', { name: 'ログイン' }).click()

    // Wait for navigation and check for the cues page heading
    await page.waitForURL('/admin/cues')
    await expect(page.getByRole('heading', { name: '演出管理' })).toBeVisible()
  })

  test('should show an error on failed login', async ({ page, goto }) => {
    // Go to the login page with runtime config overrides
    await goto('/admin/login', {
      waitUntil: 'hydration',
      nuxt: {
        runtimeConfig: nuxtConfig
      }
    })
    await expect(page.getByRole('heading', { name: '管理者ログイン' })).toBeVisible()

    // Fill in a wrong password and click login
    await page.getByPlaceholder('パスワード').fill('wrong-password')
    await page.getByRole('button', { name: 'ログイン' }).click()

    // Check for the error toast message
    await expect(page.getByRole('alert').getByText('ログイン失敗')).toBeVisible()
  })

  test('should allow logout', async ({ page, goto }) => {
    // Log in first
    await goto('/admin/login', {
      waitUntil: 'hydration',
      nuxt: {
        runtimeConfig: nuxtConfig
      }
    })
    await page.getByPlaceholder('パスワード').fill(adminPassword)
    await page.getByRole('button', { name: 'ログイン' }).click()
    await page.waitForURL('/admin/cues')

    // Click the logout button
    await page.getByRole('button', { name: 'ログアウト' }).click()

    // Wait for navigation and check for the login page heading
    await page.waitForURL('/admin/login')
    await expect(page.getByRole('heading', { name: '管理者ログイン' })).toBeVisible()
  })
})
