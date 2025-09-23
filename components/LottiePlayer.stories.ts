import type { Meta, StoryObj } from '@storybook/vue3'

import LottiePlayer from './LottiePlayer.vue'

const meta = {
  title: 'Component/LottiePlayer',
  component: LottiePlayer,
  tags: ['autodocs'],
  args: {
    src: 'https://lottie.host/8f936f87-231a-4093-8243-166b6c006dcf/3y9n419fSt.json',
  },
} satisfies Meta<typeof LottiePlayer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
