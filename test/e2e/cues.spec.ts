import { test, expect } from '@playwright/test';

const hasAuthEnv = process.env.SUPABASE_TEST_EMAIL && process.env.SUPABASE_TEST_PASSWORD;

test.describe('演出管理(Cues)', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasAuthEnv, 'テスト用の認証情報が設定されていません');
    await page.goto('/admin/login');
    await page.getByLabel('メールアドレス').click();
    await page.getByLabel('メールアドレス').type(process.env.SUPABASE_TEST_EMAIL!, { delay: 100 });
    await page.getByLabel('パスワード').fill(process.env.SUPABASE_TEST_PASSWORD!);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForURL('/admin/cues', { timeout: 10000 });
    await expect(page).toHaveURL('/admin/cues');
  });

  test('演出のCRUD操作が正常に行えること', async ({ page }) => {
    const cueName = 'テストカラー';
    const cueNameUpdated = 'テストカラー編集済み';
    const cueType = '単色';
    const cueValue = '#123456';

    // 作成
    // TODO: webkitで新規演出追加 → 保存のあとダイアログが閉じていない
    await test.step('新しい演出を作成する', async () => {
      await page.getByRole('button', { name: '新規演出を追加' }).click();
      await page.getByLabel('演出名').fill(cueName);
      await page.getByRole('radio', { name: cueType }).check();
      await page.getByLabel('値').fill(cueValue);
      await page.getByRole('button', { name: '保存' }).click();

      // 追加された行がテーブルに現れるまで待機
      await expect.poll(async () => {
        const rows = await page.locator('tr').allTextContents();
        return rows.some(row => row.includes(cueName) && row.includes(cueType) && row.includes(cueValue));
      }, { timeout: 5000 }).toBeTruthy();

      // 新規追加分は末尾に来ることが多い
      const newCueRow = page.locator('tr')
        .filter({ has: page.getByRole('cell', { name: cueName }) })
        .filter({ has: page.getByRole('cell', { name: cueType }) })
        .filter({ has: page.getByRole('cell', { name: cueValue }) })
        .last();
      await expect(newCueRow).toBeVisible();
    });

    // 編集
    await test.step('作成した演出を編集する', async () => {
      const row = page.locator('tr')
        .filter({ has: page.getByRole('cell', { name: cueName }) })
        .filter({ has: page.getByRole('cell', { name: cueType }) })
        .filter({ has: page.getByRole('cell', { name: cueValue }) })
        .last();
      await expect(row).toBeVisible();
      await row.getByRole('button', { name: '編集' }).click();

      // 編集フォームに新しい名前を入力
      await page.getByLabel('演出名').fill(cueNameUpdated);
      await page.getByRole('button', { name: '保存' }).click();

      // ダイアログが閉じるのを待つ（open=falseになるまで）
      await expect(page.getByRole('dialog')).not.toBeVisible();

      // 編集後の行が表示されるまで待機
      const updatedRow = page.locator('tr')
        .filter({ has: page.getByRole('cell', { name: cueNameUpdated }) })
        .filter({ has: page.getByRole('cell', { name: cueType }) })
        .filter({ has: page.getByRole('cell', { name: cueValue }) })
        .last();
      await expect(updatedRow).toBeVisible();
    });

    // 削除
    await test.step('編集した演出を削除する', async () => {
      const row = page.locator('tr')
        .filter({ has: page.getByRole('cell', { name: cueNameUpdated }) })
        .filter({ has: page.getByRole('cell', { name: cueType }) })
        .filter({ has: page.getByRole('cell', { name: cueValue }) })
        .last();
      await expect(row).toBeVisible();
      await row.getByRole('button', { name: '削除' }).click();
      await page.getByRole('button', { name: 'はい、削除します' }).click();

      // 削除後、行が表示されないことを確認
      await expect(row).not.toBeVisible();
    });
  });
});
