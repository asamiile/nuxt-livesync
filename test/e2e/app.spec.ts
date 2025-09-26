import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { Page } from 'playwright-core'
import { setup, createPage, url } from '@nuxt/test-utils/e2e'
import * as dotenv from 'dotenv'

// Load environment variables for local testing.
dotenv.config()

describe('Nuxt Livesync E2E Test', () => {
  // Setup the Nuxt test environment before all tests.
  // Allow a long timeout for the initial setup, especially on CI.
  beforeAll(async () => {
    await setup()
  }, 60000)

  describe('Scenario 1: Admin Authentication Flow', () => {
    it('1.1: Unauthenticated user should be redirected to login page', async () => {
      const page = await createPage()
      await page.goto(url('/admin/cues'), { waitUntil: 'networkidle' })
      // Expect to be redirected to the login page and see the login header.
      await expect(page.getByRole('heading', { name: '管理者ログイン' })).toBeVisible()
      expect(page.url()).toContain('/admin/login')
      await page.close()
    })

    it('1.2: Login should be successful', async () => {
      const page = await createPage()
      await page.goto(url('/admin/login'), { waitUntil: 'networkidle' })

      // Input credentials from .env file
      await page.fill('input[name="email"]', process.env.SUPABASE_TEST_EMAIL || '')
      await page.fill('input[name="password"]', process.env.SUPABASE_TEST_PASSWORD || '')

      // Click the login button
      await page.click('button[type="submit"]')

      // Wait for navigation by checking for a specific element on the destination page.
      await expect(page.getByRole('heading', { name: '演出管理' })).toBeVisible()
      expect(page.url()).toContain('/admin/cues')

      await page.close()
    })
  })

  describe('Scenario 2: Cue Management (CRUD) Flow', () => {
    let page: Page

    // Log in once before running all tests in this describe block.
    beforeAll(async () => {
      page = await createPage()
      await page.goto(url('/admin/login'), { waitUntil: 'networkidle' })

      await page.fill('input[name="email"]', process.env.SUPABASE_TEST_EMAIL || '')
      await page.fill('input[name="password"]', process.env.SUPABASE_TEST_PASSWORD || '')
      await page.click('button[type="submit"]')

      // Wait for the heading to be visible, confirming login and navigation.
      await expect(page.getByRole('heading', { name: '演出管理' })).toBeVisible()
    })

    afterAll(async () => {
      await page.close()
    })

    const cueName = `Test Cue 1`
    const updatedCueName = `Updated Cue Name`

    it('2.1: Create a new cue', async () => {
      // Click 'Add New Cue' button.
      await page.getByRole('button', { name: '新規演出を追加' }).click()

      // Fill in the dialog.
      await page.getByLabel('演出名').fill(cueName)
      await page.getByLabel('種類').selectOption({ label: '単色' })
      await page.getByLabel('値').fill('#ff00ff')
      await page.getByRole('button', { name: '保存' }).click()

      // Verify the new cue is visible in the table.
      await expect(page.getByRole('row', { name: cueName })).toBeVisible()
    })

    it('2.2: Edit the cue', async () => {
      // Find the row and click the 'Edit' button.
      const row = page.getByRole('row', { name: cueName })
      await row.getByRole('button', { name: '編集' }).click()

      // Update the cue name.
      await page.getByLabel('演出名').fill(updatedCueName)
      await page.getByRole('button', { name: '保存' }).click()

      // Verify the cue name is updated in the table.
      await expect(page.getByRole('row', { name: updatedCueName })).toBeVisible()
      await expect(page.getByRole('row', { name: cueName })).not.toBeVisible()
    })

    it('2.3: Delete the cue', async () => {
      // Find the row and click the 'Delete' button.
      const row = page.getByRole('row', { name: updatedCueName })
      await row.getByRole('button', { name: '削除' }).click()

      // Confirm deletion in the dialog.
      await page.getByRole('button', { name: 'はい、削除します' }).click()

      // Verify the cue is removed from the table.
      await expect(page.getByRole('row', { name: updatedCueName })).not.toBeVisible()
    })
  })

  describe('Scenario 3: Real-time Sync Flow', () => {
    // This test is complex and requires more time.
    it('3.1: Cue execution should sync with the viewer page', async () => {
      const realTimeCueName = `E2E Real-time Test Cue ${Date.now()}`
      const cueColor = '#ff00ff'
      const expectedRgbColor = 'rgb(255, 0, 255)'

      // --- 1. Admin Setup: Create a cue for the test ---
      const adminPage = await createPage()
      await adminPage.goto(url('/admin/login'), { waitUntil: 'networkidle' })
      await adminPage.fill('input[name="email"]', process.env.SUPABASE_TEST_EMAIL || '')
      await adminPage.fill('input[name="password"]', process.env.SUPABASE_TEST_PASSWORD || '')
      await adminPage.click('button[type="submit"]')
      await expect(adminPage.getByRole('heading', { name: '演出管理' })).toBeVisible()

      await adminPage.getByRole('button', { name: '新規演出を追加' }).click()
      await adminPage.getByLabel('演出名').fill(realTimeCueName)
      await adminPage.getByLabel('種類').selectOption({ label: '単色' })
      await adminPage.getByLabel('値').fill(cueColor)
      await adminPage.getByRole('button', { name: '保存' }).click()
      await expect(adminPage.getByRole('row', { name: realTimeCueName })).toBeVisible()

      // --- 2. Viewer Setup & Execution ---
      // Open viewer page and check initial state.
      const viewerPage = await createPage()
      await viewerPage.goto(url('/'), { waitUntil: 'networkidle' })
      await expect(viewerPage.locator('body:has-text("Waiting...")')).toBeVisible()

      // Admin navigates to On-Air page and triggers the cue.
      await adminPage.goto(url('/admin/onair'), { waitUntil: 'networkidle' })
      await adminPage.getByRole('button', { name: realTimeCueName }).click()

      // --- 3. Verification ---
      // Check if viewer page background color changes.
      await expect(viewerPage.locator('body')).toHaveCSS('background-color', expectedRgbColor, { timeout: 10000 })

      // --- 4. Cleanup ---
      // Admin deletes the created cue.
      await adminPage.goto(url('/admin/cues'), { waitUntil: 'networkidle' })
      const row = adminPage.getByRole('row', { name: realTimeCueName })
      await row.getByRole('button', { name: '削除' }).click()
      await adminPage.getByRole('button', { name: 'はい、削除します' }).click()
      await expect(adminPage.getByRole('row', { name: realTimeCueName })).not.toBeVisible()

      // Close pages.
      await viewerPage.close()
      await adminPage.close()
    })
  })
})