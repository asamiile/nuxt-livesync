import { test, expect } from '@playwright/test';

test('管理者が正しいメールアドレスとパスワードでログインできること', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('メールアドレス').fill(process.env.SUPABASE_TEST_EMAIL!);
  await page.getByLabel('パスワード').fill(process.env.SUPABASE_TEST_PASSWORD!);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await expect(page).toHaveURL('/admin/cues');
});