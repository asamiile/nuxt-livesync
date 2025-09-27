// test/e2e/cues.spec.ts

import { test, expect } from '@playwright/test';

const hasAuthEnv = process.env.SUPABASE_TEST_EMAIL && process.env.SUPABASE_TEST_PASSWORD;

test.describe('演出管理(Cues)', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasAuthEnv, 'テスト用の認証情報が設定されていません');
    await page.goto('/admin/login');
    await page.getByLabel('メールアドレス').fill(process.env.SUPABASE_TEST_EMAIL!);
    await page.getByLabel('パスワード').fill(process.env.SUPABASE_TEST_PASSWORD!);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await expect(page.getByRole('heading', { name: '演出管理' })).toBeVisible();
  });

  test('演出のCRUD操作が正常に行えること', async ({ page }) => {
    const uniqueCueName = `テストカラー_${Date.now()}`;
    const uniqueCueNameUpdated = `${uniqueCueName}_編集済み`;
    const cueType = '単色';
    const cueValue = '#123456';

    // 作成(Create)
    await test.step('新しい演出を作成する', async () => {
      await page.getByRole('button', { name: '新規演出を追加' }).click();
      await page.getByLabel('演出名').fill(uniqueCueName);
      await page.getByLabel(cueType).click();
      await page.getByLabel('値').fill(cueValue);

      const createResponsePromise = page.waitForResponse(
        response => response.url().includes('/rest/v1/cues') && response.status() === 201
      );
      await page.getByRole('button', { name: '保存' }).click();
      await createResponsePromise;

      await expect(page.getByRole('cell', { name: uniqueCueName, exact: true })).toBeVisible();
    });

    // 編集(Update)
    await test.step('作成した演出を編集する', async () => {
      const row = page.getByRole('row', { name: new RegExp(uniqueCueName) });
      await row.getByRole('button', { name: '編集' }).click();
      await page.getByLabel('演出名').fill(uniqueCueNameUpdated);

      // ★★★ Update(PATCH)リクエストの完了を待つように修正 ★★★
      const updateResponsePromise = page.waitForResponse(
        response => response.url().includes('/rest/v1/cues') && response.request().method() === 'PATCH'
      );
      await page.getByRole('button', { name: '保存' }).click();
      await updateResponsePromise;

      await expect(page.getByRole('cell', { name: uniqueCueNameUpdated, exact: true })).toBeVisible();
      await expect(page.getByRole('cell', { name: uniqueCueName, exact: true })).not.toBeVisible();
    });

    // 削除(Delete)
    await test.step('編集した演出を削除する', async () => {
      const row = page.getByRole('row', { name: new RegExp(uniqueCueNameUpdated) });

      // ★★★ Deleteリクエストの完了を待つように修正 ★★★
      const deleteResponsePromise = page.waitForResponse(
        response => response.url().includes('/rest/v1/cues') && response.request().method() === 'DELETE'
      );
      await row.getByRole('button', { name: '削除' }).click();
      await page.getByRole('button', { name: 'はい、削除します' }).click();
      await deleteResponsePromise;

      await expect(page.getByRole('cell', { name: uniqueCueNameUpdated, exact: true })).not.toBeVisible();
    });
  });
});