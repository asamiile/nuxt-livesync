import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Button } from '~/components/ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me',
      },
    })
    expect(wrapper.html()).toContain('Click me')
  })
})