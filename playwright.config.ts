// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// .envファイルを読み込む（ユーザーご指摘の通り修正）
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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
    // ステップ1: まず認証を行い、状態を保存する
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // ステップ2: 認証が必要なテストを各ブラウザで実行する
    // testIgnoreを設定して、認証セットアップ自体は除外する
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
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
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    // webServerプロセスに環境変数を直接渡す
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_KEY: process.env.SUPABASE_KEY || '',
    },
    // サーバーの起動タイムアウトを延長
    timeout: 120 * 1000,
  },
});