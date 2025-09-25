import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { Label } from '~/components/ui/label'

describe('Label', () => {
  it('renders correctly', () => {
    const wrapper = mount(Label, {
      slots: {
        default: 'This is a label',
      },
    })
    expect(wrapper.html()).toContain('This is a label')
  })
})