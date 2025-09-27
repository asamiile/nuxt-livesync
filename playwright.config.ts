// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// .envファイルを読み込む
dotenv.config();

// ----- DEBUG: Loaded Environment Variables -----
console.log('--- Playwright Config: Loaded Environment Variables ---');
console.log(`SUPABASE_URL loaded: ${!!process.env.SUPABASE_URL}`);
console.log(`SUPABASE_KEY loaded: ${!!process.env.SUPABASE_KEY}`);
console.log(`SUPABASE_SERVICE_KEY loaded: ${!!process.env.SUPABASE_SERVICE_KEY}`);
console.log(`SUPABASE_TEST_EMAIL: ${process.env.SUPABASE_TEST_EMAIL}`);
console.log(`SUPABASE_TEST_PASSWORD loaded: ${!!process.env.SUPABASE_TEST_PASSWORD}`);
console.log('----------------------------------------------------');

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'pnpm preview',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});