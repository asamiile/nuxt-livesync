import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Skeleton } from '~/components/ui/skeleton'

describe('Skeleton', () => {
  it('renders correctly', () => {
    const wrapper = mount(Skeleton, {
      props: {
        class: 'w-24 h-8',
      },
    })
    expect(wrapper.html()).toContain('w-24 h-8')
  })
})