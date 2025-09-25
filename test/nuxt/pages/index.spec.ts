import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import IndexPage from '~/pages/index.vue'
import LottiePlayer from '~/components/LottiePlayer.vue'
import { nextTick } from 'vue'

const dummyCues = [
  { id: 'c1', name: 'Cue 1', type: 'color', value: '#ff0000' },
  { id: 'c2', name: 'Cue 2', type: 'animation', value: 'http://example.com/anim.json' },
]

// Supabase Clientのモックを取得
const { createBrowserClient } = await import('@supabase/ssr')
const mockSupabaseClient = createBrowserClient('', '')
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn((callback) => {
    // モックのコールバックを保存して後で呼び出せるようにする
    (mockChannel as any)._triggerCallback = callback
  }),
}
mockSupabaseClient.channel = vi.fn().mockReturnValue(mockChannel)

describe('pages/index.vue', () => {
  beforeEach(() => {
    // モックのデータを設定
    mockSupabaseClient.from.mockImplementation((tableName) => {
      if (tableName === 'cues') {
        return { select: vi.fn().mockResolvedValue({ data: dummyCues, error: null }) }
      }
      return {}
    })
  })

  it('デフォルトで待機メッセージが表示されること', async () => {
    const wrapper = await mountSuspended(IndexPage)
    expect(wrapper.text()).toContain('Waiting...')
  })

  it('Supabase Realtimeで受け取ったcueに応じて背景色が変わること', async () => {
    const wrapper = await mountSuspended(IndexPage)
    await nextTick()

    // リアルタイムイベントをシミュレート
    const payload = { new: { active_cue_id: 'c1' } }
    const handler = (mockChannel.on as any).mock.calls[0][2] // .onの3番目の引数はハンドラ
    handler(payload)
    await nextTick()

    const colorDiv = wrapper.find('.h-full.w-full')
    expect(colorDiv.exists()).toBe(true)
    expect(colorDiv.attributes('style')).toContain(`background-color: ${dummyCues[0].value}`)
  })

  it('Supabase Realtimeで受け取ったcueに応じてLottieアニメーションが表示されること', async () => {
    const wrapper = await mountSuspended(IndexPage)
    await nextTick()

    const payload = { new: { active_cue_id: 'c2' } }
    const handler = (mockChannel.on as any).mock.calls[0][2]
    handler(payload)
    await nextTick()

    const lottiePlayer = wrapper.findComponent(LottiePlayer)
    expect(lottiePlayer.exists()).toBe(true)
    expect(lottiePlayer.props('src')).toBe(dummyCues[1].value)
  })
})
