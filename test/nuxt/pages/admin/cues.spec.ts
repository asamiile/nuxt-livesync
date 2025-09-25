import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CuesPage from '~/pages/admin/cues.vue'
import { nextTick } from 'vue'
import type { Cue } from '~/types/cue'

// --- Mocks ---
const mockOrder = vi.fn()
const mockInsert = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()

const fromMock = {
  select: vi.fn(() => ({
    order: mockOrder,
  })),
  insert: mockInsert,
  delete: vi.fn(() => ({
    eq: mockEq,
  })),
}
const mockSupabase = {
  from: vi.fn(() => fromMock),
}

vi.mock('#imports', () => ({
  useSupabaseClient: () => mockSupabase,
}))
// --- End Mocks ---

const dummyCues: Cue[] = [
  { id: '1', name: 'Test Cue 1', type: 'color', value: '#111111', created_at: new Date().toISOString() },
  { id: '2', name: 'Test Cue 2', type: 'animation', value: 'url1', created_at: new Date().toISOString() },
  { id: '3', name: 'Test Cue 3', type: 'color', value: '#222222', created_at: new Date().toISOString() },
]

describe('pages/admin/cues.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOrder.mockResolvedValue({ data: [...dummyCues], error: null })
    fromMock.select.mockReturnValue({ order: mockOrder })
  })

  it('マウント時に演出リストを取得し、テーブルが正しい行数で描画されること', async () => {
    const wrapper = await mountSuspended(CuesPage)
    await nextTick()
    await nextTick()
    const bodyRows = wrapper.findAll('tbody tr')
    expect(bodyRows.length).toBe(dummyCues.length)
  })

  it('「新規演出を追加」ボタンでダイアログを開き、新しいキューを追加できること', async () => {
    const wrapper = await mountSuspended(CuesPage)
    await nextTick()
    await nextTick()

    await wrapper.find('button[aria-label="新規演出を追加"]').trigger('click')
    await nextTick()

    await wrapper.find('input[name="name"]').setValue('New Cue')
    await wrapper.find('input[name="value"]').setValue('#ffffff')
    const radio = wrapper.find<HTMLInputElement>('input[type="radio"][value="color"]')
    radio.element.checked = true
    await radio.trigger('change')
    await nextTick()

    const newCue = { id: '4', name: 'New Cue', type: 'color', value: '#ffffff', created_at: new Date().toISOString() }
    mockInsert.mockResolvedValueOnce({ data: [newCue], error: null })
    mockOrder.mockResolvedValueOnce({ data: [...dummyCues, newCue], error: null })

    await wrapper.find('form').trigger('submit.prevent')
    await nextTick()
    await nextTick()

    expect(mockInsert).toHaveBeenCalledWith([{ name: 'New Cue', type: 'color', value: '#ffffff' }])
    const bodyRows = wrapper.findAll('tbody tr')
    expect(bodyRows.length).toBe(dummyCues.length + 1)
  })

  it('削除ボタンをクリックすると、確認ダイアログが表示され、キューを削除できること', async () => {
    const wrapper = await mountSuspended(CuesPage)
    await nextTick()
    await nextTick()

    await wrapper.find('tbody tr:first-child button[aria-label="削除"]').trigger('click')
    await nextTick()

    mockDelete.mockResolvedValueOnce({ error: null })
    mockOrder.mockResolvedValueOnce({ data: dummyCues.slice(1), error: null })

    const deleteButton = document.querySelector('[data-test-id="delete-cue-button"]') as HTMLButtonElement
    deleteButton.click()
    await nextTick()
    await nextTick()

    expect(mockEq).toHaveBeenCalledWith('id', dummyCues[0].id)
    const bodyRows = wrapper.findAll('tbody tr')
    expect(bodyRows.length).toBe(dummyCues.length - 1)
  })
})