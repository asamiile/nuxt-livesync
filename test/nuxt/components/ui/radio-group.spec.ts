import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { Label } from '~/components/ui/label'

describe('RadioGroup', () => {
  it('renders correctly', async () => {
    const wrapper = mount({
      components: {
        RadioGroup,
        RadioGroupItem,
        Label,
      },
      template: `
        <RadioGroup default-value="comfortable">
          <div class="flex items-center space-x-2">
            <RadioGroupItem id="r1" value="default" />
            <Label for="r1">Default</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem id="r2" value="comfortable" />
            <Label for="r2">Comfortable</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroupItem id="r3" value="compact" />
            <Label for="r3">Compact</Label>
          </div>
        </RadioGroup>
      `,
    })

    expect(wrapper.html()).toContain('Default')
  })
})