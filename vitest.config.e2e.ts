// vitest.config.e2e.ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    include: ['test/e2e/**/*.spec.ts'], // E2Eテストのみを対象にする
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
})