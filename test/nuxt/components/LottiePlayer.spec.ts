import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import LottiePlayer from '~/components/LottiePlayer.vue'
import { defineComponent } from 'vue'

// Mock the async component
const MockDotLottieVue = defineComponent({
  name: 'DotLottieVue',
  props: {
    src: String,
    autoplay: Boolean,
    loop: Boolean,
  },
  template: '<div class="mock-lottie-player"></div>',
})

vi.mock('@lottiefiles/dotlottie-vue', () => ({
  DotLottieVue: MockDotLottieVue,
}))

describe('LottiePlayer.vue', () => {
  it('renders a fallback message initially', () => {
    const wrapper = mount(LottiePlayer, {
      props: { src: 'test.json' },
    })
    expect(wrapper.text()).toContain('Loading Animation...')
  })

  it('renders the Lottie player when src is provided', async () => {
    const src = 'https://example.com/animation.lottie'
    const wrapper = mount(LottiePlayer, {
      props: {
        src,
      },
    })

    // Wait for the async component to be loaded
    await vi.dynamicImportSettled()

    const lottiePlayer = wrapper.find('.mock-lottie-player')
    expect(lottiePlayer.exists()).toBe(true)
  })

  it('passes props to the DotLottieVue component', async () => {
    const src = 'https://example.com/animation.lottie'
    const wrapper = mount(LottiePlayer, {
      props: {
        src,
      },
    })

    // Wait for the async component to be loaded
    await vi.dynamicImportSettled()

    const lottiePlayer = wrapper.findComponent(MockDotLottieVue)
    expect(lottiePlayer.exists()).toBe(true)
    expect(lottiePlayer.props('src')).toBe(src)
    expect(lottiePlayer.props('autoplay')).toBe(true)
    expect(lottiePlayer.props('loop')).toBe(true)
  })
})
