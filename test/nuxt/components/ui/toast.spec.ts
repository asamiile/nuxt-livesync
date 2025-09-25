import { mount } from '@vue/test-utils'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import * as toastModule from '~/components/ui/toast/use-toast'
import Toaster from '~/components/ui/toast/Toaster.vue'

describe('Toaster', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('renders toasts correctly', async () => {
    const toasts = ref([])
    vi.spyOn(toastModule, 'useToast').mockReturnValue({
      toasts,
      toast: (t) => toasts.value.push({ ...t, id: '1' }),
      dismiss: (id) => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      },
    })

    const wrapper = mount(Toaster, {
      attachTo: document.body,
    })

    expect(document.body.innerHTML).not.toContain('Scheduled: Catch up')

    const { toast } = toastModule.useToast()

    toast({
      title: 'Scheduled: Catch up',
      description: 'Friday, February 10, 2023 at 5:57 PM',
    })

    await nextTick()

    expect(document.body.innerHTML).toContain('Scheduled: Catch up')
    expect(document.body.innerHTML).toContain('Friday, February 10, 2023 at 5:57 PM')

    wrapper.unmount()
  })
})