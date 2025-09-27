// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// .env ファイルを読み込む (プロジェクトルートから自動で検索される)
// これはテストランナーのプロセス（テストファイル自体）で process.env を読むために必要
dotenv.config();

const authFile = 'playwright/.auth/user.json';

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
    // 最初に認証を行い、結果を storageState に保存する
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // setup に依存するテストを各ブラウザで実行する
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/, // setup自体はこのプロジェクトで再実行しない
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: authFile,
      },
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: authFile,
      },
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
    },
  ],

  webServer: {
    // dotenv-cli を使って強制的に環境変数を注入してから開発サーバーを起動する
    command: 'pnpm exec dotenv -- pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});