import type { Meta, StoryObj } from '@storybook/vue3'
import { Label } from '.'

const meta = {
  title: 'UI/Label',
  component: Label,
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  render: args => ({
    components: { Label },
    setup() {
      return { args }
    },
    template: '<Label v-bind="args">This is a label</Label>',
  }),
  args: {},
} satisfies Story