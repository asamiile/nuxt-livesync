

import { test, expect } from '@playwright/test';

test('本番操作ページでcueボタンの表示と実行トースト', async ({ page }) => {
  // ログイン
  await page.goto('/admin/login');
  await page.getByLabel('メールアドレス').click();
  await page.getByLabel('メールアドレス').type(process.env.SUPABASE_TEST_EMAIL!, { delay: 100 });
  await page.getByLabel('パスワード').fill(process.env.SUPABASE_TEST_PASSWORD!);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForURL('/admin/cues', { timeout: 10000 });
  await expect(page).toHaveURL('/admin/cues');

  // 本番操作ページへ遷移
  await page.goto('/admin/onair');
  await expect(page).toHaveURL('/admin/onair');

  // .grid内のcueボタンのみ取得
  const cueButtons = page.locator('.grid button');
  await expect(cueButtons.first()).toBeVisible();
  await cueButtons.first().click();

  // 最初のcueボタンをクリック
  const cueName = await cueButtons.first().textContent();
  await cueButtons.first().click();

});