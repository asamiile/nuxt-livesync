import type { Meta, StoryObj } from '@storybook/vue3'

import TheHeader from './TheHeader.vue'

const meta = {
  title: 'Component/TheHeader',
  component: TheHeader,
  tags: ['autodocs'],
} satisfies Meta<typeof TheHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
