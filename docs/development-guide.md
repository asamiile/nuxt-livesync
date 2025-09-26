# 開発者向けセットアップガイド

このドキュメントは、`nuxt-livesync` プロジェクトの開発環境をセットアップするための手順書です。

## 概要

このプロジェクトは、リアルタイムで演出を同期するアプリケーションです。以下の技術スタックで構成されています。

- **フロントエンド**: [Nuxt.js](https://nuxt.com/)
- **データベース & リアルタイム通信**: [Supabase](https://supabase.io/)
- **UIカタログ**: [Storybook](https://storybook.js.org/)
- **ユニットテスト**: [Vitest](https://vitest.dev/)
- **E2Eテスト**: [Playwright](https://playwright.dev/)
- **パッケージマネージャー**: [pnpm](https://pnpm.io/)

## 1. 必要なツール

開発を始める前に、以下のツールがローカルマシンにインストールされていることを確認してください。

- **[pnpm](https://pnpm.io/installation)**
- **[Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)**

## 2. 環境構築手順

### ステップ1: リポジトリのクローン

まず、このリポジトリをクローンします。

```bash
git clone https://github.com/your-username/nuxt-livesync.git
cd nuxt-livesync
```

### ステップ2: 依存関係のインストール

`pnpm` を使って、プロジェクトの依存関係をインストールします。

```bash
pnpm install
```

### ステップ3: 環境変数の設定

プロジェクトのルートにある `.env.example` ファイルをコピーして `.env` ファイルを作成します。

```bash
cp .env.example .env
```

次に、`.env` ファイルを開き、あなたのSupabaseプロジェクトの情報を設定します。

```env
# Supabase
SUPABASE_URL="YOUR_SUPABASE_URL"
SUPABASE_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

# Test Account
# E2Eテストで使用するアカウント情報
SUPABASE_TEST_EMAIL="test-user@example.com"
SUPABASE_TEST_PASSWORD="password"
```

`SUPABASE_URL` と `SUPABASE_KEY` は、Supabaseプロジェクトの管理画面（Settings > API）で確認できます。

## 3. データベース (Supabase) のセットアップ

### ステップ1: Supabaseプロジェクトとの連携

Supabase CLI を使って、ローカル環境とSupabase上のプロジェクトを連携させます。

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

`YOUR_PROJECT_REF` は、SupabaseプロジェクトのURL (`https://[YOUR_PROJECT_REF].supabase.co`) または管理画面（Settings > General）で確認できます。

### ステップ2: マイグレーションの適用

ローカルのマイグレーションファイルをSupabaseデータベースに適用します。

```bash
supabase db push
```

これにより、必要なテーブルやスキーマがデータベースに作成されます。

## 4. 日常的な開発コマンド

開発中に使用する主要なコマンドです。

### 開発サーバーの起動

ローカルで開発サーバーを起動します。`http://localhost:3000` でアクセスできます。

```bash
pnpm dev
```

### Storybookの起動

UIコンポーネントのカタログであるStorybookを起動します。`http://localhost:6006` でアクセスできます。

```bash
pnpm storybook
```

### ユニットテストの実行

Vitestを使用してユニットテストを実行します。

```bash
pnpm test
```

### E2Eテストの実行

Playwrightを使用してE2E（エンドツーエンド）テストを実行します。

```bash
pnpm test:e2e
```