import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// 環境変数が設定されているか確認
const hasSupabaseEnv = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY;
const hasAuthEnv = process.env.SUPABASE_TEST_EMAIL && process.env.SUPABASE_TEST_PASSWORD;
const canRunTest = hasSupabaseEnv && hasAuthEnv;

// テストスイート: 本番操作ページ
// 必要な環境変数がなければスキップ
test.describe('本番操作(OnAir)', () => {
  let supabaseAdmin: SupabaseClient<any>;
  let testCue: any | null = null;

  // テスト全体のセットアップ
  test.beforeAll(async () => {
    // 環境変数がなければ処理を中断
    if (!canRunTest) return;

    // Supabase Adminクライアントを初期化
    supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

    // テスト用の演出データを作成
    const { data, error } = await supabaseAdmin
      .from('cues')
      .insert({
        name: 'Onair Test Cue',
        type: 'color',
        value: '#ff00ff',
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
    // 環境変数がなければ処理を中断
    if (!canRunTest || !testCue) return;

    // テスト用の演出データを削除
    const { error } = await supabaseAdmin.from('cues').delete().match({ id: testCue.id });
    if (error) {
      console.error('テストデータの削除に失敗しました:', error);
    }
  });

  // 各テストの前にログイン処理を実行
  test.beforeEach(async ({ page }) => {
    // テスト実行不可の場合はスキップ
    test.skip(!canRunTest, 'テスト用の環境変数が設定されていません');

    // ログインページにアクセス
    await page.goto('/admin/login');

    // 認証情報を入力してログイン
    await page.getByLabel('メールアドレス').fill(process.env.SUPABASE_TEST_EMAIL!);
    await page.getByLabel('パスワード').fill(process.env.SUPABASE_TEST_PASSWORD!);
    await page.getByRole('button', { name: 'ログイン' }).click();

    // 本番操作ページに遷移
    await page.goto('/admin/onair');
    await expect(page).toHaveURL('/admin/onair');
  });

  // テストケース: 演出の実行が正常に行えること
  test('演出の実行が正常に行えること', async ({ page }) => {
    // テスト用の演出データがなければスキップ
    if (!testCue) {
      test.skip(true, 'テスト用の演出データが作成されていません');
      return;
    }

    // 1. 作成した演出のボタンが表示されていることを確認
    const cueButton = page.getByRole('button', { name: 'Onair Test Cue' });
    await expect(cueButton).toBeVisible();

    // 2. 演出ボタンをクリック
    await cueButton.click();

    // 3. 「成功」というタイトルのトーストが表示されることを確認
    const toastTitle = page.locator('h3').filter({ hasText: '成功' });
    await expect(toastTitle).toBeVisible();

    // 4. (任意) データベースを直接確認し、live_stateが更新されていることを検証
    const { data: liveState, error } = await supabaseAdmin.from('live_state').select('*').single();
    if (error) throw error;

    expect(liveState.active_cue_id).toBe(testCue.id);
  });
});