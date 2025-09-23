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

    await wrapper.vm.$nextTick() // Wait for props to cause DOM update

    const colorDiv = wrapper.find('[style="background-color: rgb(255, 0, 0);"]')
    expect(colorDiv.exists()).toBe(true)
  })

  it('renders the Lottie component for an "animation" cue', async () => {
    const animationCue: Cue = { id: 'c2', name: 'Anim', type: 'animation', value: 'some-url' }
    const wrapper = await mountSuspended(AudiencePage, {
      props: {
        currentCue: animationCue,
      },
    })

    await wrapper.vm.$nextTick() // Wait for props to cause DOM update

    const lottieMock = wrapper.find('[data-testid="lottie-mock"]')
    expect(lottieMock.exists()).toBe(true)
  })
})
