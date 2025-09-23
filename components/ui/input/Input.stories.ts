import type { Meta, StoryObj } from '@storybook/vue3'

import Input from './Input.vue'

const meta = {
  title: 'Component/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    modelValue: 'Hello World',
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
