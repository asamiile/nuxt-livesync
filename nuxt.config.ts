import { resolve } from 'path'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/storybook",
    // VITEST実行時は@nuxtjs/supabaseを無効化する
    ...(!process.env.VITEST ? ["@nuxtjs/supabase"] : []),
  ],
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_KEY,
    redirectOptions: {
      login: '/admin/login',
      callback: '/confirm',
      exclude: ['/'],
    }
  },
  css: ['@/assets/css/tailwind.css'],
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },
  // VITEST実行時にモックを自動インポートする
  hooks: {
    'imports:dirs': (dirs) => {
      if (process.env.VITEST) {
        dirs.push(resolve(__dirname, './test/mocks'))
      }
    }
  }
})