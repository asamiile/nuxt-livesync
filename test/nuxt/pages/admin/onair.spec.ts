import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import OnAirPage from '~/pages/admin/onair.vue'
import type { Cue } from '~/types/cue'
import { nextTick, ref } from 'vue'

// --- Mocks ---
// useToastをモック化
vi.mock('@/components/ui/toast/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// --- Mocks ---
const dummyCues: Cue[] = [
  { id: 'c1', name: 'Cue 1', type: 'color', value: '#ff0000' },
  { id: 'c2', name: 'Cue 2', type: 'animation', value: 'url1' },
  { id: 'c3', name: 'Cue 3', type: 'color', value: '#00ff00' },
]

// $fetchをモック化して、useFetchが内部で使う通信を模倣する
const fetchMock = vi.fn((url: string) => {
  if (url === '/api/cues') {
    return Promise.resolve(dummyCues)
  }
  if (url === '/api/connections') {
    return Promise.resolve({ connections: 10 }) // モックの接続数を返す
  }
  return Promise.resolve({})
})
vi.stubGlobal('$fetch', fetchMock)
// --- End Mocks ---

describe('pages/admin/onair.vue', () => {
  beforeEach(() => {
    fetchMock.mockClear() // 各テストの前にモックをリセット
  })

  it('APIから取得した演出リストに基づいて、正しい数のボタンがグリッド表示されること', async () => {
    const wrapper = await mountSuspended(OnAirPage)
    // useFetchが解決し、コンポーネントが再レンダリングされるのを待つ
    await nextTick()
    await nextTick()

    const buttons = wrapper.findAllComponents({ name: 'Button' })
    expect(buttons.length).toBe(dummyCues.length)
    // useFetchは内部的に追加の引数を渡すため、最初の引数のみをチェックする
    expect(fetchMock.mock.calls[0][0]).toBe('/api/cues')
  })

  it('ボタンをクリックした際に、正しいエンドポイントにPOSTリクエストが送信されること', async () => {
    const wrapper = await mountSuspended(OnAirPage)
    // useFetchが解決し、コンポーネントが再レンダリングされるのを待つ
    await nextTick()
    await nextTick()

    const firstButton = wrapper.findComponent({ name: 'Button' })
    expect(firstButton.exists()).toBe(true)

    // 最初のボタンをクリック
    await firstButton.trigger('click')

    // $fetchが呼ばれた回数を確認 (useFetch, onMounted, クリックで合計3回)
    expect(fetchMock).toHaveBeenCalledTimes(3)
    // $fetchが正しい引数で呼ばれたことを確認
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/cues/trigger/${dummyCues[0].id}`,
      { method: 'POST' },
    )
  })

  it('ボタンをクリックした際に、クリックされたボタンのvariantが"default"に変わり、他のボタンは"outline"のままであること', async () => {
    const wrapper = await mountSuspended(OnAirPage)
    // useFetchが解決し、コンポーネントが再レンダリングされるのを待つ
    await nextTick()
    await nextTick()

    const buttons = wrapper.findAllComponents({ name: 'Button' })
    expect(buttons.length).toBe(dummyCues.length)

    // 最初のボタンをクリック
    await buttons[0].trigger('click')
    await nextTick()

    // 最初のボタンのvariantが'default'であることを確認
    expect(buttons[0].props('variant')).toBe('default')

    // 他のボタンのvariantが'outline'であることを確認
    for (let i = 1; i < buttons.length; i++) {
      expect(buttons[i].props('variant')).toBe('outline')
    }

    // 2番目のボタンをクリック
    await buttons[1].trigger('click')
    await nextTick()

    // 最初のボタンのvariantが'outline'に戻り、2番目のボタンが'default'になることを確認
    expect(buttons[0].props('variant')).toBe('outline')
    expect(buttons[1].props('variant')).toBe('default')
  })
})
