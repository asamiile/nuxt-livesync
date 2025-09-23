import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AudiencePage from '~/pages/audience.vue'
import LottiePlayer from '~/components/LottiePlayer.vue'

// Lottieコンポーネントのモック化
// `vue-lottie`ではなく、プロジェクト内のLottiePlayer.vueをモックする
vi.mock('~/components/LottiePlayer.vue', () => {
  return {
    // defineComponentの形式に合わせる
    default: {
      name: 'LottiePlayer',
      template: '<div data-testid="mock-lottie-player"></div>',
      props: ['src']
    }
  }
})

describe('pages/audience.vue', () => {
  it('初期状態では待機中のメッセージが表示されること', async () => {
    const wrapper = await mountSuspended(AudiencePage)
    expect(wrapper.text()).toContain('待機中...')
  })
})
