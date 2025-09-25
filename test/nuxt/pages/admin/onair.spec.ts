import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import OnAirPage from '~/pages/admin/onair.vue'
import { nextTick } from 'vue'
import type { Cue } from '~/types/cue'
import { Button } from '~/components/ui/button'

// --- Mocks ---
vi.mock('@/components/ui/toast/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

const mockOrder = vi.fn()
const mockUpdate = vi.fn().mockReturnThis()
const mockEq = vi.fn().mockResolvedValue({ error: null })
const mockFrom = vi.fn((tableName: string) => {
  if (tableName === 'cues') {
    return {
      select: vi.fn(() => ({ order: mockOrder })),
    }
  }
  if (tableName === 'live_state') {
    return {
      update: mockUpdate,
      eq: mockEq,
    }
  }
})
const mockSupabase = { from: mockFrom }

vi.mock('#imports', () => ({
  useSupabaseClient: () => mockSupabase,
}))
// --- End Mocks ---

const dummyCues: Cue[] = [
  { id: 'c1', name: 'Cue 1', type: 'color', value: '#ff0000', created_at: new Date().toISOString() },
  { id: 'c2', name: 'Cue 2', type: 'animation', value: 'url1', created_at: new Date().toISOString() },
]

describe('pages/admin/onair.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOrder.mockResolvedValue({ data: [...dummyCues], error: null })
  })

  it('演出リストに基づいて正しい数のボタンが描画されること', async () => {
    const wrapper = await mountSuspended(OnAirPage)
    await nextTick()
    await nextTick()
    const buttons = wrapper.findAllComponents(Button)
    expect(buttons.length).toBe(dummyCues.length + 1)
  })

  it('ボタンをクリックした際に、live_stateテーブルが更新されること', async () => {
    const wrapper = await mountSuspended(OnAirPage)
    await nextTick()
    await nextTick()
    const firstButton = wrapper.findAllComponents(Button)[0]
    await firstButton.trigger('click')
    expect(mockFrom).toHaveBeenCalledWith('live_state')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ active_cue_id: dummyCues[0].id })
    )
    expect(mockEq).toHaveBeenCalledWith('id', 1)
  })

  it('ボタンをクリックすると、そのボタンのvariantが"default"に変わること', async () => {
    const wrapper = await mountSuspended(OnAirPage)
    await nextTick()
    await nextTick()
    const buttons = wrapper.findAllComponents(Button)
    const firstCueButton = buttons[0]
    const secondCueButton = buttons[1]
    await firstCueButton.trigger('click')
    await nextTick()
    expect(firstCueButton.props('variant')).toBe('default')
    expect(secondCueButton.props('variant')).toBe('outline')
  })

  it('OFFボタンをクリックすると、active_cue_idがnullで更新されること', async () => {
    const wrapper = await mountSuspended(OnAirPage)
    await nextTick()
    await nextTick()
    const offButton = wrapper.findAllComponents(Button).at(-1)
    await offButton.trigger('click')
    expect(mockFrom).toHaveBeenCalledWith('live_state')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ active_cue_id: null })
    )
    expect(mockEq).toHaveBeenCalledWith('id', 1)
  })
})