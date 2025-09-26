import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    testTimeout: 60_000, // タイムアウトを60秒に延長
    hookTimeout: 60_000,
  },
})