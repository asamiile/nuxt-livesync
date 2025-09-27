import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// 必要な環境変数が設定されているか確認
if (!process.env.SUPABASE_TEST_EMAIL || !process.env.SUPABASE_TEST_PASSWORD) {
  throw new Error(
    'SUPABASE_TEST_EMAILとSUPABASE_TEST_PASSWORDを.envファイルに設定してください。',
  );
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './test/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    // 認証セットアップ用のプロジェクト
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // 認証が必要なテストは、保存された認証情報を使用する
        storageState: 'playwright/.auth/user.json',
      },
      // 認証セットアップに依存させる
      dependencies: ['setup'],
      // このプロジェクトで実行するテストファイルを指定
      testIgnore: /auth\.spec\.ts/,
    },

    // 認証が不要なテスト用のプロジェクト (auth.spec.tsなど)
    {
      name: 'chromium-unauthenticated',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /auth\.spec\.ts/,
    },

    // ... (FirefoxとWebKitも同様に設定) ...
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /auth\.spec\.ts/,
    },
    {
      name: 'firefox-unauthenticated',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /auth\.spec\.ts/,
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
      testIgnore: /auth\.spec\.ts/,
    },
    {
      name: 'webkit-unauthenticated',
      use: { ...devices['Desktop Safari'] },
      testMatch: /auth\.spec\.ts/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    // command: 'npm run start',
    command: 'pnpm preview',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
