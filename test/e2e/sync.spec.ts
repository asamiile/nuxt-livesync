
import { test, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const hasSupabaseEnv = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY;
const hasAuthEnv = process.env.SUPABASE_TEST_EMAIL && process.env.SUPABASE_TEST_PASSWORD;
const canRunTest = hasSupabaseEnv && hasAuthEnv;

test.describe('リアルタイム同期', () => {
  let supabaseAdmin: SupabaseClient<any>;
  let testCue: any | null = null;

  test.beforeAll(async () => {
    if (!canRunTest) return;
    supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
    const { data, error } = await supabaseAdmin
      .from('cues')
      .insert({
        name: 'Sync Test Cue',
        type: 'color',
        value: '#112233',
      })
      .select()
      .single();
    if (error) throw error;
    testCue = data;
  });

  test.afterAll(async () => {
    if (!canRunTest || !testCue) return;
    await supabaseAdmin.from('live_state').update({ active_cue_id: null }).eq('id', 1);
    await supabaseAdmin.from('cues').delete().match({ id: testCue.id });
  });

  test('管理者の操作が観客画面にリアルタイムで反映されること', async ({ browser }) => {
    // HEX→RGB変換関数
    function hexToRgb(hex: string): string {
      const h = hex.replace('#', '');
      const bigint = parseInt(h, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgb(${r}, ${g}, ${b})`;
    }

    // テスト用cueの値から期待RGBを生成
    const cueHex = testCue.value; // 例: '#112233'
    const expectedRgb = hexToRgb(cueHex);
    test.skip(!canRunTest, 'テスト用の環境変数が設定されていません');
    if (!testCue) {
      test.skip(true, 'テスト用の演出データが作成されていません');
      return;
    }

    // 観客・管理者の2画面を用意
    const audienceContext = await browser.newContext();
    const adminContext = await browser.newContext();
    const audiencePage = await audienceContext.newPage();
    const adminPage = await adminContext.newPage();

    // 観客画面初期状態
    await audiencePage.goto('/');
    await expect(audiencePage.getByRole('heading', { name: 'Waiting...' })).toBeVisible();

    // 管理者ログイン＆本番操作画面へ
    await adminPage.goto('/admin/login');
    await adminPage.getByLabel('メールアドレス').fill(process.env.SUPABASE_TEST_EMAIL!);
    await adminPage.getByLabel('パスワード').fill(process.env.SUPABASE_TEST_PASSWORD!);
    await adminPage.getByRole('button', { name: 'ログイン' }).click();
    await expect(adminPage).toHaveURL(/\/admin\/(cues|onair)/);
    await adminPage.goto('/admin/onair');
    await expect(adminPage).toHaveURL('/admin/onair');

    // 管理者が演出を実行
    await adminPage.getByRole('button', { name: 'Sync Test Cue' }).click();

    // 観客画面の変化を検証
    // 1. Waiting...が消える（h1要素のテキスト一覧で判定）
    await expect.poll(async () => {
      const headings = await audiencePage.locator('h1').allTextContents();
      return !headings.includes('Waiting...');
    }, { timeout: 15000 }).toBeTruthy();

    // 2. 背景色が変わる（HEX→RGB変換で動的判定）
    await expect.poll(async () => {
      const colorDiv = audiencePage.locator('div[style*="background-color"]');
      const style = await colorDiv.getAttribute('style');
      return style && style.includes(`background-color: ${expectedRgb}`);
    }, { timeout: 15000 }).toBeTruthy();

    await audienceContext.close();
    await adminContext.close();
  });
});