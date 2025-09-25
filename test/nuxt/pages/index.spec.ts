import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '~/pages/index.vue'
import LottiePlayer from '~/components/LottiePlayer.vue'
import { nextTick } from 'vue'
import type { Cue } from '~/types/cue'

// --- Mocks ---
let triggerCallback: (payload: any) => void
const mockSubscription = {
  on: vi.fn((event, filter, callback) => {
    triggerCallback = callback
    return mockSubscription
  }),
  subscribe: vi.fn(() => mockSubscription),
}
const mockSelect = vi.fn()
const mockSupabase = {
  from: () => ({
    select: mockSelect,
  }),
  channel: () => mockSubscription,
}

vi.mock('#imports', () => ({
  useSupabaseClient: () => mockSupabase,
}))
// --- End Mocks ---

const dummyCues: Cue[] = [
  { id: 'c1', name: 'Cue 1', type: 'color', value: '#ff0000', created_at: new Date().toISOString() },
  { id: 'c2', name: 'Cue 2', type: 'animation', value: 'http://example.com/anim.json', created_at: new Date().toISOString() },
]

describe('pages/index.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelect.mockResolvedValue({ data: [...dummyCues], error: null })
  })

  it('デフォルトで待機メッセージが表示されること', async () => {
    const wrapper = await mountSuspended(IndexPage)
    expect(wrapper.text()).toContain('Waiting...')
  })

  it('Supabase Realtimeで受け取ったcueに応じて背景色が変わること', async () => {
    const wrapper = await mountSuspended(IndexPage)
    await nextTick()
    const payload = { new: { active_cue_id: 'c1' } }
    triggerCallback(payload)
    await nextTick()
    const colorDiv = wrapper.find('.h-full.w-full')
    expect(colorDiv.exists()).toBe(true)
    expect(colorDiv.attributes('style')).toContain(`background-color: ${dummyCues[0].value}`)
  })

  it('Supabase Realtimeで受け取ったcueに応じてLottieアニメーションが表示されること', async () => {
    const wrapper = await mountSuspended(IndexPage)
    await nextTick()
    const payload = { new: { active_cue_id: 'c2' } }
    triggerCallback(payload)
    await nextTick()
    const lottiePlayer = wrapper.findComponent(LottiePlayer)
    expect(lottiePlayer.exists()).toBe(true)
    expect(lottiePlayer.props('src')).toBe(dummyCues[1].value)
  })

  it('active_cue_idがnullの場合、待機メッセージが表示されること', async () => {
    const wrapper = await mountSuspended(IndexPage)
    await nextTick()
    triggerCallback({ new: { active_cue_id: 'c1' } })
    await nextTick()
    expect(wrapper.find('.h-full.w-full').exists()).toBe(true)
    triggerCallback({ new: { active_cue_id: null } })
    await nextTick()
    expect(wrapper.text()).toContain('Waiting...')
    expect(wrapper.findComponent(LottiePlayer).exists()).toBe(false)
    expect(wrapper.find('.h-full.w-full').exists()).toBe(false)
  })
})