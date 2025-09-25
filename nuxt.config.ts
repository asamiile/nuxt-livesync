// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/storybook",
  ],
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

  // --- Runtime proxy ---
  // https://nuxt.com/docs/guide/going-further/proxy-and-server-routes
  routeRules: {
    '/api/**': {
      proxy: 'http://127.0.0.1:8000',
    },
  },
})