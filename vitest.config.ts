import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    globals: true,
    // Forcing all tests to run in the 'nuxt' environment.
    // This is because the composable under test (`useAuth`) relies on other
    // Nuxt composables (`useSupabaseUser`, etc.) that require the Nuxt
    // application context to be available. Mocking them via `#imports`
    // only works reliably inside the 'nuxt' test environment.
    environment: 'nuxt',
  },
})