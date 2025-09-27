import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // ログインページにアクセス
  await page.goto('/admin/login');

  // 認証情報を入力
  await page.getByLabel('メールアドレス').fill(process.env.SUPABASE_TEST_EMAIL!);
  await page.getByLabel('パスワード').fill(process.env.SUPABASE_TEST_PASSWORD!);

  // 「ログイン」ボタンをクリック
  await page.getByRole('button', { name: 'ログイン' }).click();

  // ログイン後のページにリダイレクトされていることを確認
  await expect(page).toHaveURL('/admin/cues');

  // 認証情報をファイルに保存
  await page.context().storageState({ path: authFile });
});