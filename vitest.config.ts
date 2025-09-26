import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    // By using `projects`, we explicitly opt into the modern API
    // and avoid the deprecated `environmentMatchGlobs` which was causing the warning.
    // We define a single project since all our tests need the `nuxt` environment.
    projects: [
      {
        name: 'nuxt',
        test: {
          globals: true,
          environment: 'nuxt',
        },
      },
    ],
  },
})