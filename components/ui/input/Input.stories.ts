import type { Meta, StoryObj } from '@storybook/vue3'
import { Input } from '.'

const meta = {
  title: 'UI/Input',
  component: Input,
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  render: args => ({
    components: { Input },
    setup() {
      return { args }
    },
    template: '<Input v-bind="args" />',
  }),
  args: {
    placeholder: 'Enter text...',
  },
} satisfies Story