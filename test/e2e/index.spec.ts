import { test, expect } from '@playwright/test';

// テストスイート: トップページのテスト
test.describe('トップページ', () => {

  // テストケース: ページタイトルが正しいこと
  test('ページタイトルが正しく表示されること', async ({ page }) => {
    // 1. トップページにアクセス
    await page.goto('/');

    // 2. ページのタイトルが 'nuxt-livesync' を含んでいることを確認
    await expect(page).toHaveTitle(/LiveSync/);
  });

  // テストケース: h1見出しが存在すること
  test('h1見出しが表示されていること', async ({ page }) => {
    // 1. トップページにアクセス
    await page.goto('/');

    // 2. 'Waiting...' というテキストを持つh1要素が表示されていることを確認
    const heading = page.getByRole('heading', { name: 'Waiting...' });
    await expect(heading).toBeVisible();
  });
});

// テストスイート: ログインページのテスト
test.describe('ログインページ', () => {
  // テストケース: ページタイトルが正しいこと
  test('ページタイトルが正しく表示されること', async ({ page }) => {
    // 1. ログインページにアクセス
    await page.goto('/admin/login');

    // 2. '管理者ログイン' というテキストを持つh2要素が表示されていることを確認
    const heading = page.getByRole('heading', { name: '管理者ログイン' });
    await expect(heading).toBeVisible();
  });
});