import type { Meta, StoryObj } from '@storybook/vue3'
import { h } from 'vue'

import Label from './Label.vue'

const meta = {
  title: 'Component/Label',
  component: Label,
  tags: ['autodocs'],
  render: (args: any) => ({
    components: { Label },
    setup() {
      return () => h(Label, args, {
        default: () => 'Your Email Address'
      })
    }
  })
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
