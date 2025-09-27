import { test, expect } from '@playwright/test';

test('cueボタンの操作でindexページの表示が同期される', async ({ page, context }) => {
  // ログイン
  await page.goto('/admin/login');
  await page.getByLabel('メールアドレス').click();
  await page.getByLabel('メールアドレス').type(process.env.SUPABASE_TEST_EMAIL!, { delay: 100 });
  await page.getByLabel('パスワード').fill(process.env.SUPABASE_TEST_PASSWORD!);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await page.waitForURL('/admin/cues', { timeout: 10000 });
  await expect(page).toHaveURL('/admin/cues');

  // indexページを別タブで開く
  const viewerPage = await context.newPage();
  await viewerPage.goto('/');

  // 1. ページ表示直後は「Waiting...」表示
  await expect(viewerPage.getByText('Waiting...')).toBeVisible();

  // onairページへ遷移
  await page.goto('/admin/onair');
  await page.waitForURL('/admin/onair', { timeout: 10000 });
  await expect(page).toHaveURL('/admin/onair');

  // .grid内のcueボタン一覧を取得
  const cueButtons = page.locator('.grid button');
  const firstCueButton = cueButtons.first();
  // 最初のcueボタンの色（style属性）を取得
  const cueColorStyle = await firstCueButton.locator('div[style*="background-color"]').getAttribute('style');

  // cueボタンをクリック
  await firstCueButton.click();

  // 2. クリック後、indexページの背景色がcueボタンの色と一致することを検証
  await expect.poll(async () => {
    const style = await viewerPage.locator('div[style*="background-color"]').first().getAttribute('style');
    return style ?? '';
  }, { timeout: 10000 }).toContain(cueColorStyle ?? '');
});