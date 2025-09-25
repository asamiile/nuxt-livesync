import type { Meta, StoryObj } from '@storybook/vue3'
import { RadioGroup, RadioGroupItem } from '.'
import { Label } from '../label'

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  subcomponents: { RadioGroupItem },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  render: args => ({
    components: { RadioGroup, RadioGroupItem, Label },
    setup() {
      return { args }
    },
    template: `
      <RadioGroup v-bind="args">
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
  args: {
    defaultValue: 'comfortable',
  },
} satisfies Story