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
  it("currentCue の type が 'color' の場合に、指定された色の div が表示されること", async () => {
    const wrapper = await mountSuspended(AudiencePage)

    // コンポーネントの内部状態を操作してテストする
    await wrapper.vm.setRed()

    const colorDiv = wrapper.find('[style*="background-color"]')
    expect(colorDiv.exists()).toBe(true)
    // happy-domではhexがそのまま使われるため、rgbに変換せずにチェックする
    expect(colorDiv.attributes('style')).toContain('background-color: #ef4444;')

    // モックのLottieは表示されない
    const lottiePlayer = wrapper.find('[data-testid="mock-lottie-player"]')
    expect(lottiePlayer.exists()).toBe(false)
  })

  it("currentCue の type が 'animation' の場合に、モック化したLottieコンポーネントが表示されること", async () => {
    const wrapper = await mountSuspended(AudiencePage)

    // コンポーネントの内部状態を操作
    await wrapper.vm.setAnimation()

    const lottiePlayer = wrapper.findComponent({ name: 'LottiePlayer' })
    expect(lottiePlayer.exists()).toBe(true)
    expect(wrapper.find('[data-testid="mock-lottie-player"]').exists()).toBe(true)

    // 色のdivは表示されない
    const colorDiv = wrapper.find('[style*="background-color"]')
    expect(colorDiv.exists()).toBe(false)
  })

  it('初期状態では待機中のメッセージが表示されること', async () => {
    const wrapper = await mountSuspended(AudiencePage)
    expect(wrapper.text()).toContain('待機中...')
  })
})
