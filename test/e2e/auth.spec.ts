import { test, expect } from '@playwright/test';

test('管理者が正しいメールアドレスとパスワードでログインできること', async ({ page }) => {
  await page.goto('/admin/login');

  // フォーム入力
  await page.getByLabel('メールアドレス').click();
  await page.getByLabel('メールアドレス').type(process.env.SUPABASE_TEST_EMAIL!, { delay: 100 });
  await page.getByLabel('パスワード').fill(process.env.SUPABASE_TEST_PASSWORD!);

  // ログインボタンをクリック
  await page.getByRole('button', { name: 'ログイン' }).click();

  // リダイレクトを待機
  await page.waitForURL('/admin/cues', { timeout: 10000 });

  // URLを検証
  await expect(page).toHaveURL('/admin/cues');
});

test('管理者がログアウトできること', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('メールアドレス').click();
  await page.getByLabel('メールアドレス').type(process.env.SUPABASE_TEST_EMAIL!, { delay: 100 });
  await page.getByLabel('パスワード').fill(process.env.SUPABASE_TEST_PASSWORD!);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForURL('/admin/cues', { timeout: 10000 });
  await expect(page).toHaveURL('/admin/cues');

  // ヘッダーのログアウトボタンをクリック
  await page.getByRole('button', { name: 'ログアウト' }).click();

  // ログイン画面に戻ることを検証
  await page.waitForURL('/admin/login', { timeout: 10000 });
  await expect(page).toHaveURL('/admin/login');
});