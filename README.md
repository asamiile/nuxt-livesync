# Livesync App

Livesync Appは、リアルタイムで演出（カラー・アニメーション等）を配信・同期できるライブビューアアプリケーションです。
Supabaseを利用したデータ管理と、Nuxt 3による高速なUI表示を特徴としています。
管理者は演出を操作し、観客は即座に反映された演出を体験できます。

## Overview

### Features

- リアルタイムで演出（カラー・アニメーション等）を配信・同期
- 管理者による演出操作・切り替え
- 観客側は即座に演出を受信・表示
- Supabaseによるデータ管理・リアルタイム通信
- Lottieアニメーション対応
- StorybookによるUIカタログ
- Tailwind CSSによるレスポンシブデザイン
- E2Eテスト（Playwright）・ユニットテスト（Vitest）対応

### Technology Stack

- Front-end Framework: Nuxt.js v3
- UI Component: shadcn/vue
- CSS Framework: Tailwind CSS
- UI Catalog: Storybook
Vitest is temporarily discontinued due to errors
- Baas: Supabase
- Test: Vitest, Playwright
- Deploy: Vercel


### demo

- [Livesync App](https://nuxt-livesync.vercel.app)

## Getting Started

### Nuxt

- Make sure to install dependencies:

```bash
pnpm install
```

- Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

- Build the application for production:

```bash
pnpm build
```

- Locally preview production build:

```bash
pnpm preview
```


### Supabase

#### Migration

- initial setup

```bash
supabase login
supabase link --project-ref [project-ref]
```

- Applying the migration file

```bash
supabase db push
```

- Viewing Migration History

```bash
supabase migration list
```

- Repairing migration history

```bash
supabase migration repair [TIMESTAMP] --status applied
```


### Storybook

- Launch the Storybook Viewer on `http://localhost:6006`:

```bash
pnpm run storybook
```


### Vitest

- Run Unit and Component Test

```bash
pnpm run test
```


### Playwright

- Run E2E Test

```bash
pnpm test:e2e
```
