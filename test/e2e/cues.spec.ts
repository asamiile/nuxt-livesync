import { test, expect } from '@playwright/test';

// テストスイート: 演出管理ページ
test.describe('演出管理(Cues)', () => {
  // test.beforeEach(...) のログイン処理を削除

  // 各テストの開始時に、直接ページにアクセスする
  test('演出のCRUD操作が正常に行えること', async ({ page }) => {
    await page.goto('/admin/cues');
    const cueName = 'テストカラー';
    const cueNameUpdated = 'テストカラー編集済み';
    const cueType = '単色';
    const cueValue = '#123456';

    // 作成(Create)
    await test.step('新しい演出を作成する', async () => {
      // 1. 「新規演出を追加」ボタンをクリック
      await page.getByRole('button', { name: '新規演出を追加' }).click();

      // 2. フォームに情報を入力
      await page.getByLabel('演出名').fill(cueName);
      await page.getByLabel('種類').click();
      await page.getByRole('option', { name: cueType }).click();
      await page.getByLabel('値').fill(cueValue);

      // 3. 「保存」ボタンをクリック
      await page.getByRole('button', { name: '保存' }).click();

      // 4. テーブルに新しい演出が追加されていることを確認
      const newCueRow = page.locator('tr', { hasText: cueName });
      await expect(newCueRow).toBeVisible();
    });

    // 編集(Update)
    await test.step('作成した演出を編集する', async () => {
      // 1. 編集する行の「編集」ボタンをクリック
      const row = page.locator('tr', { hasText: cueName });
      await row.getByRole('button', { name: '編集' }).click();

      // 2. 演出名を変更
      await page.getByLabel('演出名').fill(cueNameUpdated);

      // 3. 「保存」ボタンをクリック
      await page.getByRole('button', { name: '保存' }).click();

      // 4. テーブルの表示が更新されていることを確認
      const updatedCueRow = page.locator('tr', { hasText: cueNameUpdated });
      await expect(updatedCueRow).toBeVisible();
      await expect(page.locator('tr', { hasText: cueName })).not.toBeVisible();
    });

    // 削除(Delete)
    await test.step('編集した演出を削除する', async () => {
      // 1. 削除する行の「削除」ボタンをクリック
      const row = page.locator('tr', { hasText: cueNameUpdated });
      await row.getByRole('button', { name: '削除' }).click();

      // 2. 確認ダイアログで「はい、削除します」をクリック
      await page.getByRole('button', { name: 'はい、削除します' }).click();

      // 3. テーブルから演出が削除されていることを確認
      const deletedCueRow = page.locator('tr', { hasText: cueNameUpdated });
      await expect(deletedCueRow).not.toBeVisible();
    });
  });
});