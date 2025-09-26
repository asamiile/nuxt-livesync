import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { Page } from 'playwright-core'
import { setup, createPage, url } from '@nuxt/test-utils/e2e'
import * as dotenv from 'dotenv'

// Load environment variables for local testing.
// In GitHub Actions, these variables are set as secrets.
dotenv.config()

describe('Nuxt Livesync E2E Test', async () => {
  // Setup the Nuxt test environment.
  // This will start a server with the Nuxt application.
  await setup({
    // browser: true, // Uncomment to run in browser context
    // browserOptions: {
    //   type: 'chromium',
    //   launch: {
    //     headless: true, // Run in headless mode
    //   },
    // },
  })

  describe('Scenario 1: Admin Authentication Flow', () => {
    it('1.1: Unauthenticated user should be redirected to login page', async () => {
      const page = await createPage()
      await page.goto(url('/admin/cues'), { waitUntil: 'networkidle' })
      expect(page.url()).toContain('/admin/login')
      await page.close()
    })

    it('1.2: Login should be successful', async () => {
      const page = await createPage()
      await page.goto(url('/admin/login'), { waitUntil: 'networkidle' })

      // Input credentials
      await page.fill('input[name="email"]', process.env.SUPABASE_TEST_EMAIL || '')
      await page.fill('input[name="password"]', process.env.SUPABASE_TEST_PASSWORD || '')

      // Click the login button
      await page.click('button[type="submit"]')

      // Wait for navigation and check the URL
      await page.waitForURL('**/admin/cues')
      expect(page.url()).toContain('/admin/cues')

      await page.close()
    })
  })

  describe('Scenario 2: Cue Management (CRUD) Flow', () => {
    let page: Page

    beforeAll(async () => {
      page = await createPage()
      await page.goto(url('/admin/login'), { waitUntil: 'networkidle' })

      await page.fill('input[name="email"]', process.env.SUPABASE_TEST_EMAIL || '')
      await page.fill('input[name="password"]', process.env.SUPABASE_TEST_PASSWORD || '')
      await page.click('button[type="submit"]')
      await page.waitForURL('**/admin/cues')
    })

    afterAll(async () => {
      await page.close()
    })

    const cueName = `E2E Test Cue ${Date.now()}`
    const updatedCueName = `${cueName}-updated`

    it('2.1: Create a new cue', async () => {
      // Click 'Add New Cue' button
      await page.getByRole('button', { name: '新規演出を追加' }).click()

      // Fill in the dialog
      await page.getByLabel('演出名').fill(cueName)
      await page.getByLabel('種類').selectOption({ label: '単色' })
      await page.getByLabel('値').fill('#ff00ff')
      await page.getByRole('button', { name: '保存' }).click()

      // Verify the new cue is in the table
      await expect(page.getByText(cueName)).toBeVisible()
    })

    it('2.2: Edit the cue', async () => {
      // Find the row and click the 'Edit' button
      const row = page.getByRole('row', { name: cueName })
      await row.getByRole('button', { name: '編集' }).click()

      // Update the cue name
      await page.getByLabel('演出名').fill(updatedCueName)
      await page.getByRole('button', { name: '保存' }).click()

      // Verify the cue name is updated
      await expect(page.getByText(updatedCueName)).toBeVisible()
      await expect(page.getByText(cueName)).not.toBeVisible()
    })

    it('2.3: Delete the cue', async () => {
      // Find the row and click the 'Delete' button
      const row = page.getByRole('row', { name: updatedCueName })
      await row.getByRole('button', { name: '削除' }).click()

      // Confirm deletion in the dialog
      await page.getByRole('button', { name: 'はい、削除します' }).click()

      // Verify the cue is removed from the table
      await expect(page.getByText(updatedCueName)).not.toBeVisible()
    })
  })

  describe('Scenario 3: Real-time Sync Flow', () => {
    it('3.1: Cue execution should sync with the viewer page', async () => {
      const realTimeCueName = `E2E Real-time Test Cue ${Date.now()}`
      const cueColor = '#ff00ff'
      const expectedRgbColor = 'rgb(255, 0, 255)'

      // --- 1. Setup: Create a cue for the test ---
      const adminPage = await createPage()
      await adminPage.goto(url('/admin/login'), { waitUntil: 'networkidle' })
      await adminPage.fill('input[name="email"]', process.env.SUPABASE_TEST_EMAIL || '')
      await adminPage.fill('input[name="password"]', process.env.SUPABASE_TEST_PASSWORD || '')
      await adminPage.click('button[type="submit"]')
      await adminPage.waitForURL('**/admin/cues')

      await adminPage.getByRole('button', { name: '新規演出を追加' }).click()
      await adminPage.getByLabel('演出名').fill(realTimeCueName)
      await adminPage.getByLabel('種類').selectOption({ label: '単色' })
      await adminPage.getByLabel('値').fill(cueColor)
      await adminPage.getByRole('button', { name: '保存' }).click()
      await expect(adminPage.getByText(realTimeCueName)).toBeVisible()

      // --- 2. Execution ---
      // Open viewer page and check initial state
      const viewerPage = await createPage()
      await viewerPage.goto(url('/'), { waitUntil: 'networkidle' })
      await expect(viewerPage.locator('body')).toHaveText('Waiting...')

      // Admin triggers the cue
      await adminPage.goto(url('/admin/onair'), { waitUntil: 'networkidle' })
      await adminPage.getByRole('button', { name: realTimeCueName }).click()

      // --- 3. Verification ---
      // Check if viewer page background color changes
      await expect(viewerPage.locator('body')).toHaveCSS('background-color', expectedRgbColor, { timeout: 5000 })

      // --- 4. Cleanup ---
      // Delete the created cue
      await adminPage.goto(url('/admin/cues'), { waitUntil: 'networkidle' })
      const row = adminPage.getByRole('row', { name: realTimeCueName })
      await row.getByRole('button', { name: '削除' }).click()
      await adminPage.getByRole('button', { name: 'はい、削除します' }).click()
      await expect(adminPage.getByText(realTimeCueName)).not.toBeVisible()

      // Close pages
      await viewerPage.close()
      await adminPage.close()
    }, 20000) // Increase timeout for this complex test
  })
})