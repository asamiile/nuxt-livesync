import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CuesPage from './cues.vue'
import { TableBody, TableRow } from '@/components/ui/table'
import { DialogContent } from '@/components/ui/dialog'
import type { Cue } from '~/types/cue'

const dummyCues: Cue[] = [
  { id: '1', name: 'Cue 1', type: 'color', value: '#111111' },
  { id: '2', name: 'Cue 2', type: 'animation', value: 'url1' },
  { id: '3', name: 'Cue 3', type: 'color', value: '#333333' },
]

describe('pages/admin/cues.vue', () => {
  it('renders the correct number of rows based on props', async () => {
    const wrapper = await mountSuspended(CuesPage, {
      props: {
        cues: dummyCues,
      },
    })

    const tableBody = wrapper.findComponent(TableBody)
    const rows = tableBody.findAllComponents(TableRow)
    expect(rows.length).toBe(dummyCues.length)
  })

  it('shows the dialog when the "新規演出を追加" button is clicked', async () => {
    const wrapper = await mountSuspended(CuesPage, {
      props: {
        cues: [],
      },
    })

    // The DialogContent is in the DOM but not visible
    const dialogContent = wrapper.findComponent(DialogContent)
    expect(dialogContent.isVisible()).toBe(false)

    const addButton = wrapper.find('button[aria-haspopup="dialog"]')
    expect(addButton.exists()).toBe(true)

    await addButton.trigger('click')

    expect(dialogContent.isVisible()).toBe(true)
  })
})
