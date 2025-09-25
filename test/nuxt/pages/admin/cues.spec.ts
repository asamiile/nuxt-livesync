import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CuesPage from '~/pages/admin/cues.vue'
import { nextTick } from 'vue'

const dummyCues = [
  { id: '1', name: 'Test Cue 1', type: 'color', value: '#111111' },
  { id: '2', name: 'Test Cue 2', type: 'animation', value: 'url1' },
  { id: '3', name: 'Test Cue 3', type: 'color', value: '#222222' },
]

const { createBrowserClient } = await import('@supabase/ssr')
const mockSupabaseClient = createBrowserClient('', '')

describe('pages/admin/cues.vue', () => {
  beforeEach(() => {
    mockSupabaseClient.from.mockImplementation((tableName) => {
      if (tableName === 'cues') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: dummyCues, error: null }),
          }),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }
    })
  })

  it('マウント時に演出リストを取得し、テーブルが正しい行数で描画されること', async () => {
    const wrapper = await mountSuspended(CuesPage)
    await nextTick()
    await nextTick()

    const bodyRows = wrapper.findAll('tbody tr')
    expect(bodyRows.length).toBe(dummyCues.length)
  })

  it('「新規演出を追加」ボタンをクリックすると、isDialogOpenの状態がtrueに変わること', async () => {
    const wrapper = await mountSuspended(CuesPage)
    await nextTick()
    await nextTick()

    expect(wrapper.vm.isDialogOpen.value).toBe(false)

    const addButton = wrapper.find('button', { text: '新規演出を追加' })
    await addButton.trigger('click')
    await nextTick()

    expect(wrapper.vm.isDialogOpen.value).toBe(true)
  })
})
