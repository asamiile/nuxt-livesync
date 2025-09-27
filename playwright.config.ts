// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// .envファイルを読み込む
dotenv.config();

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
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL!,
      SUPABASE_KEY: process.env.SUPABASE_KEY!,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY!,
      SUPABASE_TEST_EMAIL: process.env.SUPABASE_TEST_EMAIL!,
      SUPABASE_TEST_PASSWORD: process.env.SUPABASE_TEST_PASSWORD!,
    },
  },
});