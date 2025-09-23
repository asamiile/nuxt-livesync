import type { Meta, StoryObj } from '@storybook/vue3'
import { RadioGroup, RadioGroupItem } from '.'
import { Label } from '../label'

const meta = {
  title: 'Component/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  render: (args: any) => ({
    components: { RadioGroup, RadioGroupItem, Label },
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
  }),
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
