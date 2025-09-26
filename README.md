# Livesync App


## Overview

### Technology Stack

- Front-end Framework: Nuxt.js v3
- UI Component: shadcn/vue
- CSS Framework: Tailwind CSS
- UI Catalog: Storybook
Vitest is temporarily discontinued due to errors
- Data Base: Supabase
- Test: Vitest
- Deploy: Vercel


### demo

- [Livesync App](https://nuxt-livesync.vercel.app)
- [Stoyrbook]()

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