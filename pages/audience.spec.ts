import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AudiencePage from './audience.vue'
import type { Cue } from '~/types/cue'

vi.mock('vue3-lottie', () => ({
    default: {
        name: 'Vue3Lottie',
        template: '<div data-testid="lottie-mock">Lottie Mock</div>'
    }
}))

describe('pages/audience.vue', () => {
  it('renders waiting state when no cue is provided', async () => {
    const wrapper = await mountSuspended(AudiencePage)
    expect(wrapper.text()).toContain('待機中...')
  })

  it('renders a colored div for a "color" cue', async () => {
    const colorCue: Cue = { id: 'c1', name: 'Red', type: 'color', value: '#ff0000' }
    const wrapper = await mountSuspended(AudiencePage, {
      props: {
        currentCue: colorCue,
      },
    })

    const colorDiv = wrapper.find('[data-testid="color-display"]')
    expect(colorDiv.exists()).toBe(true)
    // Assert the style with the correct hex code format
    expect(colorDiv.attributes('style')).toContain('background-color: #ff0000;')
  })

  it('renders the Lottie component for an "animation" cue', async () => {
    const animationCue: Cue = { id: 'c2', name: 'Anim', type: 'animation', value: 'some-url' }
    const wrapper = await mountSuspended(AudiencePage, {
      props: {
        currentCue: animationCue,
      },
    })

    const lottieMock = wrapper.find('[data-testid="lottie-mock"]')
    expect(lottieMock.exists()).toBe(true)
  })
})
