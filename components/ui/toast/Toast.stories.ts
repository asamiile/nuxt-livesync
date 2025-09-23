import type { Meta, StoryObj } from '@storybook/vue3'

import { Toaster } from '.'
import { toast } from './use-toast'
import { Button } from '../button'

const meta = {
  title: 'Component/Toast',
  component: Toaster,
  tags: ['autodocs'],
  render: (args: any) => ({
    components: { Toaster, Button },
    setup() {
      return {
        args,
        toast,
      }
    },
    template: `
      <Toaster />
      <Button @click="() => toast({ title: 'Hello World' })">
        Show Toast
      </Button>
    `,
  }),
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
