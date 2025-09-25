import type { Meta, StoryObj } from '@storybook/vue3'
import { Button } from '.'

const meta = {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Click me</Button>',
  }),
  args: {
    variant: 'default',
    size: 'default',
  },
}

export const Destructive: Story = {
  ...Default,
  args: {
    ...Default.args,
    variant: 'destructive',
  },
}

export const Outline: Story = {
  ...Default,
  args: {
    ...Default.args,
    variant: 'outline',
  },
}

export const Secondary: Story = {
  ...Default,
  args: {
    ...Default.args,
    variant: 'secondary',
  },
}

export const Ghost: Story = {
  ...Default,
  args: {
    ...Default.args,
    variant: 'ghost',
  },
}

export const Link: Story = {
  ...Default,
  args: {
    ...Default.args,
    variant: 'link',
  },
}