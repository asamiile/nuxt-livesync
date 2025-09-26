// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/storybook",
    "@nuxtjs/supabase",
  ],
  supabase: {
    // Provide dummy values for testing if environment variables are not set
    url: process.env.SUPABASE_URL || 'http://localhost:54321',
    key: process.env.SUPABASE_KEY || 'dummykey', // Use SUPABASE_KEY for the anon key
    redirectOptions: {
      login: '/admin/login',
      callback: '/confirm',
      exclude: ['/'],
    }
  },
  css: ['@/assets/css/tailwind.css'],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  },
})