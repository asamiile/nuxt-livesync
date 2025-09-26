// vitest.config.ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    globals: true,
    environment: 'nuxt',
    include: ['test/unit/**/*.spec.ts', 'test/nuxt/**/*.spec.ts'],
    exclude: ['node_modules', 'test/e2e/**'],
  },
})