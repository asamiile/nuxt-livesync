import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import CuesPage from '~/pages/admin/cues.vue'
import LottiePlayer from '~/components/LottiePlayer/LottiePlayer.vue'
import { nextTick } from 'vue'

// --- Mocks for Supabase Client ---
const mockEq = vi.fn()
const mockUpdate = vi.fn(() => ({ eq: mockEq }))
const mockDelete = vi.fn(() => ({ eq: mockEq }))
const mockInsert = vi.fn()
const mockOrder = vi.fn()
const mockSelect = vi.fn(() => ({ order: mockOrder }))
const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
}))

const mockSupabaseClient = { from: mockFrom }
mockNuxtImport('useSupabaseClient', () => () => mockSupabaseClient)

// --- Initial Data ---
const initialCues = [
  { id: '1', name: 'Red Light', type: 'color', value: '#ff0000' },
]

describe('pages/admin/cues.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsert.mockResolvedValue({ error: null })
    mockEq.mockResolvedValue({ error: null })
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    document.body.innerHTML = ''
  })

  const mountComponent = (cuesData = initialCues) => {
    // Mock the data fetch that happens on mount
    mockOrder.mockResolvedValue({ data: [...cuesData], error: null })
    return mountSuspended(CuesPage, {
      attachTo: document.body,
      global: {
        stubs: {
          LottiePlayer: { template: '<div />' },
        }
      }
    })
  }

  it('should open a dialog when "新規演出を追加" button is clicked', async () => {
    const wrapper = await mountComponent([])
    await nextTick()
    await wrapper.find('header button').trigger('click')
    await nextTick()
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
  })

  it('should call insert when saving a new cue', async () => {
    const wrapper = await mountComponent([])
    // onMounted calls fetchCues -> select -> order once
    expect(mockOrder).toHaveBeenCalledOnce()
    await nextTick()

    await wrapper.find('header button').trigger('click')
    await nextTick()

    const dialog = document.querySelector('[role="dialog"]')
    const nameInput = dialog.querySelector('input#name') as HTMLInputElement
    const valueInput = dialog.querySelector('input#value') as HTMLInputElement
    const saveButton = Array.from(dialog.querySelectorAll('button')).find(b => b.textContent.trim() === '保存')

    nameInput.value = 'New Blue'
    nameInput.dispatchEvent(new Event('input'))
    valueInput.value = '#0000ff'
    valueInput.dispatchEvent(new Event('input'))
    await nextTick()

    saveButton.click()
    await nextTick() // Allow async handler to complete

    expect(mockInsert).toHaveBeenCalledOnce()
    // Check that fetchCues was called again by checking its inner call to order()
    expect(mockOrder).toHaveBeenCalledTimes(2)
  })

  it('should call update when saving an edited cue', async () => {
    const wrapper = await mountComponent()
    expect(mockOrder).toHaveBeenCalledOnce()
    await nextTick()

    await wrapper.findAll('button').find(b => b.text().trim() === '編集').trigger('click')
    await nextTick()

    const dialog = document.querySelector('[role="dialog"]')
    const nameInput = dialog.querySelector('input#name') as HTMLInputElement
    const saveButton = Array.from(dialog.querySelectorAll('button')).find(b => b.textContent.trim() === '保存')

    nameInput.value = 'Bright Red Light'
    nameInput.dispatchEvent(new Event('input'))
    await nextTick()

    saveButton.click()
    await nextTick()

    expect(mockUpdate).toHaveBeenCalledOnce()
    expect(mockEq).toHaveBeenCalledWith('id', initialCues[0].id)
    expect(mockOrder).toHaveBeenCalledTimes(2)
  })

  it('should call delete when a cue is deleted', async () => {
    const wrapper = await mountComponent()
    expect(mockOrder).toHaveBeenCalledOnce()
    await nextTick()

    await wrapper.findAll('button').find(b => b.text().trim() === '削除').trigger('click')
    await nextTick()

    const alertDialog = document.querySelector('[role="alertdialog"]')
    const confirmButton = Array.from(alertDialog.querySelectorAll('button')).find(b => b.textContent.trim() === 'はい、削除します')

    confirmButton.click()
    await nextTick()

    expect(mockDelete).toHaveBeenCalledOnce()
    expect(mockEq).toHaveBeenCalledWith('id', initialCues[0].id)
    expect(mockOrder).toHaveBeenCalledTimes(2)
  })
})