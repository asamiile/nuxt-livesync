import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import OnAirPage from '~/pages/admin/onair.vue'
import type { Cue } from '~/types/cue'
import { nextTick } from 'vue'

vi.mock('@/components/ui/toast/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

const dummyCues: Cue[] = [
  { id: 'c1', name: 'Cue 1', type: 'color', value: '#ff0000' },
  { id: 'c2', name: 'Cue 2', type: 'animation', value: 'url1' },
]

const fetchMock = vi.fn().mockResolvedValue({ connections: 10 })
vi.stubGlobal('$fetch', fetchMock)

const { createBrowserClient } = await import('@supabase/ssr')
const mockSupabaseClient = createBrowserClient('', '')

describe('pages/admin/onair.vue', () => {
  const mockUpdate = vi.fn().mockReturnThis()
  const mockEq = vi.fn().mockResolvedValue({ error: null })

  beforeEach(() => {
    fetchMock.mockClear()
    mockUpdate.mockClear()
    mockEq.mockClear()

    mockSupabaseClient.from.mockImplementation((tableName) => {
      if (tableName === 'cues') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: dummyCues, error: null }),
          }),
        }
      }
      if (tableName === 'live_state') {
        return { update: mockUpdate, eq: mockEq }
      }
      return { from: vi.fn() }
    })
  })

  it('演出リストに基づいて正しい数のボタンが描画されること', async () => {
    const wrapper = await mountSuspended(OnAirPage)
    await nextTick()
    await nextTick()
    const buttons = wrapper.findAllComponents({ name: 'Button' })
    expect(buttons.length).toBe(dummyCues.length)
  })

  it('ボタンをクリックした際に、live_stateテーブルが更新されること', async () => {
    const wrapper = await mountSuspended(OnAirPage)
    await nextTick()
    await nextTick()

    const firstButton = wrapper.findComponent({ name: 'Button' })
    await firstButton.trigger('click')

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('live_state')
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ active_cue_id: dummyCues[0].id }))
    expect(mockEq).toHaveBeenCalledWith('id', 1)
  })

  it('ボタンをクリックすると、そのボタンのvariantが"default"に変わること', async () => {
    const wrapper = await mountSuspended(OnAirPage)
    await nextTick()
    await nextTick()

    const buttons = wrapper.findAllComponents({ name: 'Button' })
    await buttons[0].trigger('click')
    await nextTick()

    expect(buttons[0].props('variant')).toBe('default')
    expect(buttons[1].props('variant')).toBe('outline')
  })
})
