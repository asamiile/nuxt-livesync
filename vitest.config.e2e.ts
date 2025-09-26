import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    globals: true,
    environment: 'nuxt',
    include: ['test/e2e/**/*.spec.ts'],
    testTimeout: 60000, // Set a longer timeout for E2E tests
  },
})