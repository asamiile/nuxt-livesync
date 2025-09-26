import { test, expect } from '@playwright/test';

// 環境変数が設定されているか確認
const hasAuthEnv = process.env.SUPABASE_TEST_EMAIL && process.env.SUPABASE_TEST_PASSWORD;

// テストスイート: 認証機能
// 環境変数が設定されていない場合はスキップ
test.describe('認証機能', () => {
  // テストケース: ログイン・ログアウトが正常に行えること
  test('ログイン・ログアウトが正常に行えること', async ({ page }) => {
    // 環境変数がなければテストをスキップ
    test.skip(!hasAuthEnv, 'テスト用の認証情報が設定されていません');

    // 1. ログインページにアクセス
    await page.goto('/admin/login');

    // 2. 認証情報を入力
    await page.getByLabel('メールアドレス').fill(process.env.SUPABASE_TEST_EMAIL!);
    await page.getByLabel('パスワード').fill(process.env.SUPABASE_TEST_PASSWORD!);

    // 3. 「ログイン」ボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();

    // 4. ログイン後のページにリダイレクトされていることを確認
    await expect(page).toHaveURL('/admin/cues');

    // 5. ヘッダーに「ログアウト」ボタンが表示されていることを確認
    const logoutButton = page.getByRole('button', { name: 'ログアウト' });
    await expect(logoutButton).toBeVisible();

    // 6. 「ログアウト」ボタンをクリック
    await logoutButton.click();

    // 7. ログアウト後、ログインページに戻っていることを確認
    await expect(page).toHaveURL('/admin/login');
  });

  // テストケース: 無効な認証情報でログインに失敗すること
  test('無効な認証情報でログインに失敗すること', async ({ page }) => {
    // 1. ログインページにアクセス
    await page.goto('/admin/login');

    // 2. 無効な認証情報を入力
    await page.getByLabel('メールアドレス').fill('invalid@example.com');
    await page.getByLabel('パスワード').fill('invalidpassword');

    // 3. 「ログイン」ボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();

    // 4. URLが変わらないことを確認
    await expect(page).toHaveURL('/admin/login');

    // 5. 「ログイン失敗」のトーストが表示されることを確認
    const toast = page.getByText('ログイン失敗');
    await expect(toast).toBeVisible();
  });
});