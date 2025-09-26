import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'node', // E2E tests run in a Node.js environment
    testTimeout: 20000, // Increase timeout for E2E tests
    globals: true,
    setupFiles: [],
    include: ['test/e2e/**/*.spec.ts'],
  },
  define: {
    'import.meta.vitest': false,
  },
})