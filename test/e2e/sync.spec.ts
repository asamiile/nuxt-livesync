import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// 環境変数が設定されているか確認
const hasSupabaseEnv = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY;
const hasAuthEnv = process.env.SUPABASE_TEST_EMAIL && process.env.SUPABASE_TEST_PASSWORD;
const canRunTest = hasSupabaseEnv && hasAuthEnv;

// テストスイート: リアルタイム同期
// 必要な環境変数がなければスキップ
test.describe('リアルタイム同期', () => {
  let supabaseAdmin: SupabaseClient<any>;
  let testCue: any | null = null;

  // テスト全体のセットアップ
  test.beforeAll(async () => {
    if (!canRunTest) return;

    supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

    // テスト用の演出データを作成
    const { data, error } = await supabaseAdmin
      .from('cues')
      .insert({
        name: 'Sync Test Cue',
        type: 'color',
        value: '#112233',
      })
      .select()
      .single();

    if (error) {
      console.error('テストデータの作成に失敗しました:', error);
      throw error;
    }
    testCue = data;
  });

  // テスト全体のクリーンアップ
  test.afterAll(async () => {
    if (!canRunTest || !testCue) return;

    // live_stateをリセット
    await supabaseAdmin.from('live_state').update({ active_cue_id: null }).eq('id', 1);

    // テスト用の演出データを削除
    await supabaseAdmin.from('cues').delete().match({ id: testCue.id });
  });

  // テストケース: 管理者の操作が観客画面にリアルタイムで反映されること
  test('管理者の操作が観客画面にリアルタイムで反映されること', async ({ browser }) => {
    test.skip(!canRunTest, 'テスト用の環境変数が設定されていません');
    if (!testCue) {
        test.skip(true, 'テスト用の演出データが作成されていません');
        return;
    }

    // 観客と管理者、2つのブラウザコンテキストを作成
    const audienceContext = await browser.newContext();
    const adminContext = await browser.newContext();

    const pageA = await audienceContext.newPage(); // 観客ページ
    const pageB = await adminContext.newPage(); // 管理者ページ

    // 1. 観客ページ (pageA) のセットアップ
    await pageA.goto('/');
    const waitingHeading = pageA.getByRole('heading', { name: 'Waiting...' });
    await expect(waitingHeading).toBeVisible();

    // 2. 管理者ページ (pageB) でログインし、セットアップ
    await pageB.goto('/admin/login');
    await pageB.getByLabel('メールアドレス').fill(process.env.SUPABASE_TEST_EMAIL!);
    await pageB.getByLabel('パスワード').fill(process.env.SUPABASE_TEST_PASSWORD!);
    await pageB.getByRole('button', { name: 'ログイン' }).click();
    await expect(pageB.getByRole('heading', { name: '演出管理' })).toBeVisible();

    // 本番操作ページに遷移
    await pageB.goto('/admin/onair');
    await expect(pageB.getByRole('heading', { name: 'ライブ本番操作' })).toBeVisible();

    // 3. 管理者が演出を実行
    await pageB.getByRole('button', { name: 'Sync Test Cue' }).click();

    // 4. 観客ページの表示が更新されることを確認
    // "Waiting..."が消えるのを待つ
    await expect(waitingHeading).not.toBeVisible({ timeout: 10000 });

    // 背景色が変更されるのを待つ
    const body = pageA.locator('body');
    await expect(body).toHaveAttribute('style', `background-color: rgb(17, 34, 51);`); // #112233 -> rgb(17, 34, 51)

    // コンテキストを閉じる
    await audienceContext.close();
    await adminContext.close();
  });
});