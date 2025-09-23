import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import OnairPage from './onair.vue'
import { Button } from '@/components/ui/button'
import type { Cue } from '~/types/cue'

// Mock the useToast composable, as it's not available in the test env
vi.mock('@/components/ui/toast/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

const dummyCues: Cue[] = [
  { id: '1', name: 'Cue 1', type: 'color', value: '#111111' },
  { id: '2', name: 'Cue 2', type: 'animation', value: 'url1' },
]

describe('pages/admin/onair.vue', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
  })

  it('renders the correct number of buttons based on props', async () => {
    const wrapper = await mountSuspended(OnairPage, {
      props: {
        cues: dummyCues,
      },
    })

    const buttons = wrapper.findAllComponents(Button)
    expect(buttons.length).toBe(dummyCues.length)
  })

  it('calls console.log with the cue name when a button is clicked', async () => {
    const wrapper = await mountSuspended(OnairPage, {
      props: {
        cues: dummyCues,
      },
    })

    const firstButton = wrapper.findComponent(Button)
    await firstButton.trigger('click')

    expect(consoleLogSpy).toHaveBeenCalledWith(`Button clicked: ${dummyCues[0].name}`)
  })
})
