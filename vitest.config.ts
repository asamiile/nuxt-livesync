import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    globals: true,
    environment: 'nuxt',
    include: ['test/nuxt/**/*.spec.ts'],
    setupFiles: ['test/setup.ts'],
  },
})
