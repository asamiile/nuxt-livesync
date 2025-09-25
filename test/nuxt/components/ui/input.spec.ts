import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Input } from '~/components/ui/input'

describe('Input', () => {
  it('renders correctly', () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'test',
      },
    })
    expect(wrapper.find('input').element.value).toBe('test')
  })
})