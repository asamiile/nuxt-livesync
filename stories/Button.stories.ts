import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import { Button } from '../components/ui/button'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Component/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
    },
    default: {
      control: 'text'
    }
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn(), default: 'Button' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {
  args: {
    variant: 'default',
    size: 'default',
  },
}

export const Destructive: Story = {
  args: {
    ...Default.args,
    variant: 'destructive',
  }
}

export const Outline: Story = {
  args: {
    ...Default.args,
    variant: 'outline',
  }
}

export const Secondary: Story = {
  args: {
    ...Default.args,
    variant: 'secondary',
  }
}

export const Ghost: Story = {
  args: {
    ...Default.args,
    variant: 'ghost',
  }
}

export const Link: Story = {
  args: {
    ...Default.args,
    variant: 'link',
  }
}

export const Small: Story = {
  args: {
    ...Default.args,
    size: 'sm',
  }
}

export const Large: Story = {
  args: {
    ...Default.args,
    size: 'lg',
  }
}

export const Icon: Story = {
  args: {
    ...Default.args,
    size: 'icon',
    default: 'I',
  }
}
