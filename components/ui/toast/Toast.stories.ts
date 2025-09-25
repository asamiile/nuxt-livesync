import type { Meta, StoryObj } from '@storybook/vue3'
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '.'
import { Toaster } from '.'
import { Button } from '../button'
import { useToast } from './use-toast'

const meta = {
  title: 'UI/Toast',
  component: Toast,
  subcomponents: {
    ToastAction,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
  },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  render: args => ({
    components: {
      Toast,
      ToastAction,
      ToastClose,
      ToastDescription,
      ToastProvider,
      ToastTitle,
      ToastViewport,
      Button,
      Toaster,
    },
    setup() {
      const { toast } = useToast()

      return { args, toast }
    },
    template: `
      <div>
        <Button @click="() => toast({ title: 'Hello World' })">
          Show Toast
        </Button>
        <Toaster />
      </div>
    `,
  }),
  args: {},
} satisfies Story